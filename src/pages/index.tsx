import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  updatedAt: string | null;
  title: string;
  subtitle: string;
  author: string;
}

// interface PostPagination {
//   next_page: string;
//   results: Post[];
// }

interface HomeProps {
  posts: Post[];
}

export default function Home({ posts }: HomeProps): JSX.Element {
  const router = useRouter();
  const [pages, setPages] = useState(1);

  return (
    <>
      <Header />

      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        {posts
          .filter((item, index) => index < pages)
          .map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <section>
                <h1>{post.title}</h1>
                <p>{post.subtitle}</p>

                <div>
                  <FiCalendar />
                  <time>{post.updatedAt}</time>
                  <FiUser /> <span>{post.author}</span>
                </div>
              </section>
            </Link>
          ))}
        <button onClick={() => setPages(pages + 1)} type="button">
          {posts.length <= pages ? 'No more posts...' : 'Carregar mais posts'}
        </button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 100,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      subtitle: post.data.subtitle,
      author: post.data.author,
      updatedAt: new Date(post.first_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      ),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
