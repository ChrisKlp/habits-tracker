export const mockUser = {
  id: '1',
  role: 'user',
  email: 'john@example.com',
};

export const mockUsersService = {
  findAll: jest.fn().mockResolvedValue([mockUser]),
  findOne: jest
    .fn()
    .mockImplementation((id: string) =>
      Promise.resolve({ id, role: mockUser.role, email: mockUser.email }),
    ),
};
