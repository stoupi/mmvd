import { prisma } from '@/lib/prisma';

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      affiliation: true,
      centreName: true,
      centreCode: true,
      avatarUrl: true,
      permissions: true,
      createdAt: true
    }
  });
}

export async function updateOwnProfile(
  userId: string,
  data: { affiliation?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      affiliation: data.affiliation
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      title: true,
      affiliation: true,
      centreName: true,
      centreCode: true,
      avatarUrl: true,
      permissions: true
    }
  });
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: {
      id: true,
      avatarUrl: true
    }
  });
}

export async function deleteAvatar(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: {
      id: true,
      avatarUrl: true
    }
  });
}
