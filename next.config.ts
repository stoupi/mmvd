import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

const nextConfig: NextConfig = {
	/* config options here */
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
		],
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
	webpack: (config) => {
		config.externals = [...(config.externals || []), { canvas: 'canvas' }];
		// Fix for Zod bundling issue
		config.resolve.extensionAlias = {
			'.js': ['.js', '.ts', '.tsx'],
		};
		return config;
	},
};

export default withNextIntl(nextConfig);
