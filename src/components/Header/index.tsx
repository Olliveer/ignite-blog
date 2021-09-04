import styles from './header.module.scss';

export default function Header(): JSX.Element {
  return (
    <header className={styles.container}>
      <img src="/images/logo.svg" alt="logo spacetraveling" />
    </header>
  );
}
