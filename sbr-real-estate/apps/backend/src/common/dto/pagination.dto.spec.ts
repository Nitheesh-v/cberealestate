import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import { AppValidationPipe } from '../pipes/validation.pipe';
describe('PaginationDto', () => {
  it('supplies defaults', () => {
    expect(new PaginationDto()).toMatchObject({ page: 1, limit: 10, order: 'desc' });
  });
  it('transforms valid query values', async () => {
    const dto = plainToInstance(PaginationDto, { page: '2', limit: '20', sort: ' createdAt ' });
    expect(await validate(dto)).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.sort).toBe('createdAt');
  });
  it.each([
    { page: 0 },
    { limit: 101 },
    { page: 1.2 },
    { limit: '' },
    { sort: '$where' },
    { sort: '<script>' },
    { order: 'invalid' },
  ])('rejects invalid query %o', async (query) => {
    expect((await validate(plainToInstance(PaginationDto, query))).length).toBeGreaterThan(0);
  });
  it('forbids unknown fields', async () => {
    await expect(
      new AppValidationPipe().transform(
        { extra: 'field' },
        { type: 'query', metatype: PaginationDto },
      ),
    ).rejects.toThrow();
  });
});
