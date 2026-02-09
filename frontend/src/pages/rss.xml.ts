import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { site } from '@/config.json'
import { getSortedPosts } from '@/utils/content'

export async function GET(context: APIContext) {
  const sortedPosts = await getSortedPosts()

  return rss({
    title: site.title,
    description: site.description,
    site: context.site!,
    items: sortedPosts.map((post) => ({
      link: `/posts/${post.slug}`,
      title: post.title,
      pubDate: new Date(post.created),
      description: post.summary,
    })),
    customData: `<language>${site.lang}</language>`,
  })
}
