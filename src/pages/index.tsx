import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';
import styles from './home.module.scss';
import commonStyles from '../styles/common.module.scss';
import Post from './post/[slug]';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
  total_results_size: number;
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState(postsPagination.results);
  const [page, setPage] = useState(postsPagination.next_page);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function loadPosts() {
    await fetch(page)
      .then(response => response.json())
      .then(data => {
        setPosts([...posts, data.results[0]]);
        setPage(data.next_page);
      });
  }

  return (
    <>
      <Header />

      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <main className={styles.contentContainer}>
        {posts.map(post => (
          <section key={post.uid}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{RichText.asText(post.data.title)}</h1>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>

            <div className={commonStyles.containerAuthor}>
              <FiCalendar />
              <time>
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <FiUser /> <span>{post.data.author}</span>
            </div>
          </section>
        ))}
        <button
          disabled={posts.length === postsPagination.total_results_size}
          onClick={loadPosts}
          type="button"
        >
          {posts.length < postsPagination.total_results_size
            ? 'Carregar mais posts'
            : 'No more posts...'}
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
      fetch: ['posts.content', 'posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 1,
    }
  );

  const posts = postsResponse.results.map(item => {
    return {
      uid: item.uid,
      first_publication_date: item.first_publication_date,
      data: {
        title: item.data.title,
        subtitle: item.data.subtitle,
        author: item.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts,
        total_results_size: postsResponse.total_results_size,
      },
    },
  };
};
