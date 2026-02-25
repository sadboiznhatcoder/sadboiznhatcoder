import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://tailieucnc.xyz',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://tailieucnc.xyz/mua-ban',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://tailieucnc.xyz/linh-kien',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://tailieucnc.xyz/sua-chua',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: 'https://tailieucnc.xyz/bao-duong',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    }
  ]
}