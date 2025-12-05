import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from './prisma';

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: 'postgresql',
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		},
	},
	user: {
		additionalFields: {
			firstName: {
				type: 'string',
				required: false,
			},
			lastName: {
				type: 'string',
				required: false,
			},
			title: {
				type: 'string',
				required: false,
			},
			affiliation: {
				type: 'string',
				required: false,
			},
			centreId: {
				type: 'string',
				required: false,
			},
			permissions: {
				type: 'string[]',
				defaultValue: [],
				required: false,
			},
			isActive: {
				type: 'boolean',
				defaultValue: true,
				required: false,
			},
			avatarUrl: {
				type: 'string',
				required: false,
			},
		},
	},
	secret: process.env.BETTER_AUTH_SECRET!,
	baseURL: (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
	trustedOrigins: [
		'http://localhost:3000',
		'http://localhost:3001',
		process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''
	].filter(Boolean),
	plugins: [nextCookies()],
});
