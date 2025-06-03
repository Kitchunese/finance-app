import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainNav } from "@/components/main-nav"
import styles from "./landing-page.module.css"

export default function LandingPage() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoContainer}>
            <Link href="/" className={styles.logo}>
              FinanceApp
            </Link>
          </div>
          <MainNav />
        </div>
      </header>
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Интеллектуальное управление финансами с помощью AI
            </h1>
            <p className={styles.heroDescription}>
              Возьмите под контроль свои финансы с помощью прогнозирования бюджета на
              основе искусственного интеллекта
            </p>
            <div className={styles.ctaContainer}>
              <Link href="/register">
                <Button size="lg" className={styles.ctaButton}>
                  Начать
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.ctaIcon}
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>

          {/* картинка самого приложения */}
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImageWrapper}>
              <div className={styles.heroImage}>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero.jpg-FxiYmaqVi0671lFuJ5PZCOkGqH60zZ.jpeg"
                  alt="FinanceAI Dashboard"
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.5rem" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <div className={styles.featuresContainer}>
            <div className={styles.featuresHeader}>
              <h2 className={styles.featuresTitle}>Почему стоит выбрать FinanceApp?</h2>
              <p className={styles.featuresDescription}>
                Наше приложение использует искусственный интеллект для анализа ваших финансовых привычек и создания
                персонализированных прогнозов.
              </p>
            </div>

            {/* карточки */}
            <div className={styles.featureCards}>
              {/* карточка 1 */}
              <div className={styles.featureCard}>
                <div className={styles.featureIconContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.featureIcon}
                  >
                    <path d="M20 7h-9" />
                    <path d="M14 17H5" />
                    <circle cx="17" cy="17" r="3" />
                    <circle cx="7" cy="7" r="3" />
                  </svg>
                </div>
                <h3 className={styles.featureCardTitle}>Умная категоризация</h3>
                <p className={styles.featureCardDescription}>
                  Автоматически классифицирует ваши расходы по категориям для лучшего понимания финансов.
                </p>
              </div>

              {/* карточка 2 */}
              <div className={styles.featureCard}>
                <div className={styles.featureIconContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.featureIcon}
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <path d="m9 11 3 3L22 4" />
                  </svg>
                </div>
                <h3 className={styles.featureCardTitle}>Точные прогнозы</h3>
                <p className={styles.featureCardDescription}>
                  Получайте точные прогнозы будущих доходов и расходов на основе ваших финансовых данных.
                </p>
              </div>

              {/* карточка 3 */}
              <div className={styles.featureCard}>
                <div className={styles.featureIconContainer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={styles.featureIcon}
                  >
                    <path d="M12 2v20" />
                    <path d="m17 5-5-3-5 3" />
                    <path d="m17 19-5 3-5-3" />
                    <path d="M2 12h20" />
                    <path d="m5 7-3 5 3 5" />
                    <path d="m19 7 3 5-3 5" />
                  </svg>
                </div>
                <h3 className={styles.featureCardTitle}>Визуализация данных</h3>
                <p className={styles.featureCardDescription}>
                  Наглядные графики и диаграммы помогут вам лучше понять свои финансовые потоки.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* призыв к действию */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaSectionContainer}>
            <div className={styles.ctaBox}>
              <h2 className={styles.ctaTitle}>Готовы начать?</h2>
              <p className={styles.ctaDescription}>
                Присоединяйтесь к пользователям, которые уже оптимизировали свои финансы с помощью FinanceApp.
              </p>
              <div className={styles.ctaButtonContainer}>
                <Link href="/register">
                  <Button size="lg" variant="secondary" className={styles.ctaSecondaryButton}>
                    Попробовать бесплатно
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}></div>
          <p className={styles.copyright}>© 2025 MIDIS FinanceApp. Все права защищены.</p>
        </div>
      </footer>
    </div>
  )
}
