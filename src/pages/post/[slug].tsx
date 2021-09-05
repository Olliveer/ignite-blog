import Prismic from '@prismicio/client';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import PrismicDOM, { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import commonStyles from '../../styles/common.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div style={{ margin: 'auto auto' }}>Loading...</div>;
  }

  const readTime = post.data.content.reduce((total, content) => {
    const bodyWords = RichText.asText(content.body).split(' ').length;

    return Math.round(total + bodyWords / 200);
  }, 0);

  return (
    <>
      <Header />

      <main className={styles.postContainer}>
        <img src={post.data.banner.url} alt="banner" />
        <section>
          <h1>{post.data.title}</h1>
          <div className={commonStyles.containerAuthor}>
            <FiCalendar />
            <time>{post.first_publication_date}</time>
            <FiUser /> <span>{post.data.author}</span>
            <FiClock />
            <span>{readTime <= 1 ? '1 min' : `${readTime} mins`}</span>
          </div>

          {post.data.content.map(content => (
            <>
              <h1 className={styles.headinContent}>{content.heading}</h1>
              <div
                className={styles.content}
                key={content.heading}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: PrismicDOM.RichText.asHtml(content.body),
                }}
              />
            </>
          ))}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const allPosts = [];

  posts.results.map(post => {
    return allPosts.push({ params: { slug: post.uid } });
  });

  return {
    paths: allPosts,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      parseISO(response.first_publication_date),
      'dd MMM yyyy',
      { locale: ptBR }
    ),
    data: {
      title: RichText.asText(response.data.title),
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(item => {
        return {
          heading: item.heading,
          body: item.body,
        };
      }),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
