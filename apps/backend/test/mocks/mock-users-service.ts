import { NotFoundException } from '@nestjs/common';

export const mockUsers = [
  { id: '1', role: 'user', email: 'john@example.com' },
  { id: '2', role: 'admin', email: 'jane@example.com' },
];

export const mockUsersService = {
  findAll: jest.fn().mockResolvedValue(mockUsers),
  findOne: jest.fn().mockImplementation((id: string) => {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }),
};
