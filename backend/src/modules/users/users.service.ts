import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Error as MongooseError, Model, Types } from 'mongoose';
import { compare } from 'bcrypt';
import { User, UserRole, type UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import type { PublicUser } from '../../common/interfaces/active-user-data.interface';
/** Serializes a strict public allowlist even when a document has selected secrets. */
export function publicUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
/** Persistence boundary; every credential/session write participates in optimistic concurrency. */
@Injectable()
export class UsersService {
  /** Injects only the account model. */
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}
  /** Finds a login/recovery record; credentials are selected only inside the auth boundary. */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.users.findOne({ email }).select('+password +refreshToken +tokenVersion');
  }
  /** Reads a current account and its session generation. */
  async findById(id: string, session = false): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) throw new UnauthorizedException('Invalid account');
    const user = await this.users
      .findById(id)
      .select(session ? '+tokenVersion +refreshToken' : '+tokenVersion');
    if (!user) throw new UnauthorizedException('Account unavailable');
    return user;
  }
  /** Creates an account through save middleware, relying on a unique index for race safety. */
  async create(dto: CreateUserDto): Promise<UserDocument> {
    if (await this.users.exists({ email: dto.email }))
      throw new ConflictException('Email is already registered');
    return this.users.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: dto.role,
    });
  }
  /** Atomically replaces a session only if the original generation/digest still matches. */
  async setSession(
    id: string,
    version: number,
    digest: string,
    nextVersion: number,
    previousDigest?: string,
  ): Promise<boolean> {
    const result = await this.users.updateOne(
      {
        _id: id,
        tokenVersion: version,
        isActive: true,
        ...(previousDigest ? { refreshToken: previousDigest } : {}),
      },
      {
        $set: { refreshToken: digest, tokenVersion: nextVersion, lastLogin: new Date() },
        $inc: { __v: 1 },
      },
    );
    return result.modifiedCount === 1;
  }
  /** Revokes the entire current session, including already issued access tokens. */
  async revokeSession(id: string, version: number): Promise<void> {
    await this.users.updateOne(
      { _id: id, tokenVersion: version },
      { $unset: { refreshToken: 1 }, $inc: { tokenVersion: 1, __v: 1 } },
    );
  }
  /** Stores a single-use reset digest; raw reset tokens never enter MongoDB. */
  async setResetToken(id: string, digest: string): Promise<void> {
    await this.users.updateOne(
      { _id: id, isActive: true },
      {
        $set: {
          passwordResetToken: digest,
          passwordResetExpires: new Date(Date.now() + 15 * 60_000),
        },
        $inc: { __v: 1 },
      },
    );
  }
  /** Redeems a password reset with optimistic concurrency and the password save hook. */
  async resetPassword(digest: string, password: string): Promise<void> {
    const user = await this.users
      .findOne({
        passwordResetToken: digest,
        passwordResetExpires: { $gt: new Date() },
        isActive: true,
      })
      .select('+password +passwordResetToken +passwordResetExpires +refreshToken +tokenVersion');
    if (!user) throw new BadRequestException('Reset link is invalid or expired');
    await this.savePassword(user, password);
  }
  /** Checks the existing password before changing credentials and revoking sessions. */
  async changePassword(
    id: string,
    version: number,
    current: string,
    password: string,
  ): Promise<void> {
    const user = await this.users
      .findById(id)
      .select('+password +tokenVersion +refreshToken +passwordResetToken +passwordResetExpires');
    if (
      !user?.isActive ||
      user.tokenVersion !== version ||
      !(await compare(current, user.password))
    )
      throw new UnauthorizedException('Current password is incorrect or session expired');
    if (await compare(password, user.password))
      throw new BadRequestException('Choose a different new password');
    await this.savePassword(user, password);
  }
  /** Saves credentials atomically; simultaneous reset attempts cannot both succeed. */
  private async savePassword(user: UserDocument, password: string): Promise<void> {
    user.password = password;
    user.refreshToken = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.tokenVersion += 1;
    try {
      await user.save();
    } catch (error: unknown) {
      if (error instanceof MongooseError.VersionError)
        throw new ConflictException('Account changed; request a new link or sign in again');
      throw error;
    }
  }
  /** Marks only an active account as email verified. */
  async markVerified(id: string): Promise<void> {
    await this.users.updateOne(
      { _id: id, isActive: true },
      { $set: { isVerified: true }, $inc: { __v: 1 } },
    );
  }
  /** Applies an explicit profile allowlist, never arbitrary update operators. */
  async updateProfile(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    const fields = Object.fromEntries(
      (['firstName', 'lastName', 'phone', 'avatar'] as const)
        .filter((key) => dto[key] !== undefined)
        .map((key) => [key, dto[key]]),
    );
    if (!Object.keys(fields).length)
      throw new BadRequestException('Provide at least one profile field');
    const clearPhone = fields.phone === '';
    if (clearPhone) delete fields.phone;
    const user = await this.users.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: fields, ...(clearPhone ? { $unset: { phone: 1 } } : {}), $inc: { __v: 1 } },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundException('Account unavailable');
    return publicUser(user);
  }
  /** Returns a bounded administrative account list with a safe sort allowlist. */
  async list(query: PaginationDto) {
    const sort = query.sort ?? 'createdAt';
    if (!['createdAt', 'email', 'firstName', 'role'].includes(sort))
      throw new BadRequestException('Unsupported sort field');
    const [users, total] = await Promise.all([
      this.users
        .find()
        .sort({ [sort]: query.order === 'asc' ? 1 : -1, _id: 1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      this.users.countDocuments(),
    ]);
    return {
      users: users.map(publicUser),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
        hasNext: query.page * query.limit < total,
        hasPrev: query.page > 1,
      },
    };
  }
  /** Changes roles with immediate session revocation; admins cannot demote themselves. */
  async updateRole(id: string, role: UserRole, actorId: string): Promise<PublicUser> {
    if (!Types.ObjectId.isValid(id)) throw new BadRequestException('Invalid user identifier');
    if (id === actorId) throw new BadRequestException('You cannot change your own role');
    const user = await this.users.findByIdAndUpdate(
      id,
      { $set: { role }, $unset: { refreshToken: 1 }, $inc: { tokenVersion: 1, __v: 1 } },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundException('Account not found');
    return publicUser(user);
  }
}
