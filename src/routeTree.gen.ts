/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// Auto-generated TanStack Router route tree.

import { Route as rootRouteImport } from './routes/__root'
import { Route as TermsRouteImport } from './routes/terms'
import { Route as SitemapDotxmlRouteImport } from './routes/sitemap[.]xml'
import { Route as SignupRouteImport } from './routes/signup'
import { Route as ProfileRouteImport } from './routes/profile'
import { Route as PrizesRouteImport } from './routes/prizes'
import { Route as PrivacyRouteImport } from './routes/privacy'
import { Route as PremiumRouteImport } from './routes/premium'
import { Route as LoginRouteImport } from './routes/login'
import { Route as LeaderboardRouteImport } from './routes/leaderboard'
import { Route as ForgotPasswordRouteImport } from './routes/forgot-password'
import { Route as FaqRouteImport } from './routes/faq'
import { Route as ContactRouteImport } from './routes/contact'
import { Route as AboutRouteImport } from './routes/about'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as IndexRouteImport } from './routes/index'
import { Route as QuizIndexRouteImport } from './routes/quiz.index'
import { Route as JobsIndexRouteImport } from './routes/jobs.index'
import { Route as DashboardIndexRouteImport } from './routes/dashboard.index'
import { Route as BlogIndexRouteImport } from './routes/blog.index'
import { Route as AdminIndexRouteImport } from './routes/admin.index'
import { Route as AdminDashboardRouteImport } from './routes/admin.dashboard'
import { Route as AdminSubscriptionsRouteImport } from './routes/admin.subscriptions'
import { Route as AdminSubscriptionsVerifiedRouteImport } from './routes/admin.subscriptions.verified'
import { Route as AdminQuestionsRouteImport } from './routes/admin.questions'
import { Route as AdminQuestionsNewRouteImport } from './routes/admin.questions.new'
import { Route as AdminQuestionsIdEditRouteImport } from './routes/admin.questions.$id.edit'
import { Route as AdminCategoriesRouteImport } from './routes/admin.categories'
import { Route as AdminLeaderboardRouteImport } from './routes/admin.leaderboard'
import { Route as AdminJobsRouteImport } from './routes/admin.jobs'
import { Route as AdminUsersRouteImport } from './routes/admin.users'
import { Route as AdminBlogRouteImport } from './routes/admin.blog'
import { Route as AdminSettingsRouteImport } from './routes/admin.settings'
import { Route as QuizSessionIdRouteImport } from './routes/quiz.$sessionId'
import { Route as JobsSlugRouteImport } from './routes/jobs.$slug'
import { Route as DashboardHistoryRouteImport } from './routes/dashboard.history'
import { Route as BlogSlugRouteImport } from './routes/blog.$slug'
import { Route as QuizResultSessionIdRouteImport } from './routes/quiz.result.$sessionId'

const mk = (RouteImport, id, path) => RouteImport.update({ id, path, getParentRoute: () => rootRouteImport } as any)
const mkAdmin = (RouteImport, id, path) => RouteImport.update({ id, path, getParentRoute: () => AdminRoute } as any)

const TermsRoute = mk(TermsRouteImport, '/terms', '/terms')
const SitemapDotxmlRoute = mk(SitemapDotxmlRouteImport, '/sitemap.xml', '/sitemap.xml')
const SignupRoute = mk(SignupRouteImport, '/signup', '/signup')
const ProfileRoute = mk(ProfileRouteImport, '/profile', '/profile')
const PrizesRoute = mk(PrizesRouteImport, '/prizes', '/prizes')
const PrivacyRoute = mk(PrivacyRouteImport, '/privacy', '/privacy')
const PremiumRoute = mk(PremiumRouteImport, '/premium', '/premium')
const LoginRoute = mk(LoginRouteImport, '/login', '/login')
const LeaderboardRoute = mk(LeaderboardRouteImport, '/leaderboard', '/leaderboard')
const ForgotPasswordRoute = mk(ForgotPasswordRouteImport, '/forgot-password', '/forgot-password')
const FaqRoute = mk(FaqRouteImport, '/faq', '/faq')
const ContactRoute = mk(ContactRouteImport, '/contact', '/contact')
const AboutRoute = mk(AboutRouteImport, '/about', '/about')
const AdminRoute = mk(AdminRouteImport, '/admin', '/admin')
const IndexRoute = mk(IndexRouteImport, '/', '/')

const QuizIndexRoute = mk(QuizIndexRouteImport, '/quiz/', '/quiz/')
const JobsIndexRoute = mk(JobsIndexRouteImport, '/jobs/', '/jobs/')
const DashboardIndexRoute = mk(DashboardIndexRouteImport, '/dashboard/', '/dashboard/')
const BlogIndexRoute = mk(BlogIndexRouteImport, '/blog/', '/blog/')
const QuizSessionIdRoute = mk(QuizSessionIdRouteImport, '/quiz/$sessionId', '/quiz/$sessionId')
const JobsSlugRoute = mk(JobsSlugRouteImport, '/jobs/$slug', '/jobs/$slug')
const DashboardHistoryRoute = mk(DashboardHistoryRouteImport, '/dashboard/history', '/dashboard/history')
const BlogSlugRoute = mk(BlogSlugRouteImport, '/blog/$slug', '/blog/$slug')
const QuizResultSessionIdRoute = mk(QuizResultSessionIdRouteImport, '/quiz/result/$sessionId', '/quiz/result/$sessionId')

const AdminIndexRoute = mkAdmin(AdminIndexRouteImport, '/admin/', '/')
const AdminDashboardRoute = mkAdmin(AdminDashboardRouteImport, '/admin/dashboard', '/dashboard')
const AdminSubscriptionsRoute = mkAdmin(AdminSubscriptionsRouteImport, '/admin/subscriptions', '/subscriptions')
const AdminSubscriptionsVerifiedRoute = mkAdmin(AdminSubscriptionsVerifiedRouteImport, '/admin/subscriptions/verified', '/subscriptions/verified')
const AdminQuestionsRoute = mkAdmin(AdminQuestionsRouteImport, '/admin/questions', '/questions')
const AdminQuestionsNewRoute = mkAdmin(AdminQuestionsNewRouteImport, '/admin/questions/new', '/questions/new')
const AdminQuestionsIdEditRoute = mkAdmin(AdminQuestionsIdEditRouteImport, '/admin/questions/$id/edit', '/questions/$id/edit')
const AdminCategoriesRoute = mkAdmin(AdminCategoriesRouteImport, '/admin/categories', '/categories')
const AdminLeaderboardRoute = mkAdmin(AdminLeaderboardRouteImport, '/admin/leaderboard', '/leaderboard')
const AdminJobsRoute = mkAdmin(AdminJobsRouteImport, '/admin/jobs', '/jobs')
const AdminUsersRoute = mkAdmin(AdminUsersRouteImport, '/admin/users', '/users')
const AdminBlogRoute = mkAdmin(AdminBlogRouteImport, '/admin/blog', '/blog')
const AdminSettingsRoute = mkAdmin(AdminSettingsRouteImport, '/admin/settings', '/settings')

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/about': { id: '/about'; path: '/about'; fullPath: '/about'; preLoaderRoute: typeof AboutRouteImport; parentRoute: typeof rootRouteImport }
    '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
    '/contact': { id: '/contact'; path: '/contact'; fullPath: '/contact'; preLoaderRoute: typeof ContactRouteImport; parentRoute: typeof rootRouteImport }
    '/faq': { id: '/faq'; path: '/faq'; fullPath: '/faq'; preLoaderRoute: typeof FaqRouteImport; parentRoute: typeof rootRouteImport }
    '/forgot-password': { id: '/forgot-password'; path: '/forgot-password'; fullPath: '/forgot-password'; preLoaderRoute: typeof ForgotPasswordRouteImport; parentRoute: typeof rootRouteImport }
    '/leaderboard': { id: '/leaderboard'; path: '/leaderboard'; fullPath: '/leaderboard'; preLoaderRoute: typeof LeaderboardRouteImport; parentRoute: typeof rootRouteImport }
    '/login': { id: '/login'; path: '/login'; fullPath: '/login'; preLoaderRoute: typeof LoginRouteImport; parentRoute: typeof rootRouteImport }
    '/premium': { id: '/premium'; path: '/premium'; fullPath: '/premium'; preLoaderRoute: typeof PremiumRouteImport; parentRoute: typeof rootRouteImport }
    '/privacy': { id: '/privacy'; path: '/privacy'; fullPath: '/privacy'; preLoaderRoute: typeof PrivacyRouteImport; parentRoute: typeof rootRouteImport }
    '/prizes': { id: '/prizes'; path: '/prizes'; fullPath: '/prizes'; preLoaderRoute: typeof PrizesRouteImport; parentRoute: typeof rootRouteImport }
    '/profile': { id: '/profile'; path: '/profile'; fullPath: '/profile'; preLoaderRoute: typeof ProfileRouteImport; parentRoute: typeof rootRouteImport }
    '/signup': { id: '/signup'; path: '/signup'; fullPath: '/signup'; preLoaderRoute: typeof SignupRouteImport; parentRoute: typeof rootRouteImport }
    '/sitemap.xml': { id: '/sitemap.xml'; path: '/sitemap.xml'; fullPath: '/sitemap.xml'; preLoaderRoute: typeof SitemapDotxmlRouteImport; parentRoute: typeof rootRouteImport }
    '/terms': { id: '/terms'; path: '/terms'; fullPath: '/terms'; preLoaderRoute: typeof TermsRouteImport; parentRoute: typeof rootRouteImport }
    '/admin/': { id: '/admin/'; path: '/'; fullPath: '/admin/'; preLoaderRoute: typeof AdminIndexRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/dashboard': { id: '/admin/dashboard'; path: '/dashboard'; fullPath: '/admin/dashboard'; preLoaderRoute: typeof AdminDashboardRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/subscriptions': { id: '/admin/subscriptions'; path: '/subscriptions'; fullPath: '/admin/subscriptions'; preLoaderRoute: typeof AdminSubscriptionsRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/subscriptions/verified': { id: '/admin/subscriptions/verified'; path: '/subscriptions/verified'; fullPath: '/admin/subscriptions/verified'; preLoaderRoute: typeof AdminSubscriptionsVerifiedRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/questions': { id: '/admin/questions'; path: '/questions'; fullPath: '/admin/questions'; preLoaderRoute: typeof AdminQuestionsRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/questions/new': { id: '/admin/questions/new'; path: '/questions/new'; fullPath: '/admin/questions/new'; preLoaderRoute: typeof AdminQuestionsNewRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/questions/$id/edit': { id: '/admin/questions/$id/edit'; path: '/questions/$id/edit'; fullPath: '/admin/questions/$id/edit'; preLoaderRoute: typeof AdminQuestionsIdEditRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/categories': { id: '/admin/categories'; path: '/categories'; fullPath: '/admin/categories'; preLoaderRoute: typeof AdminCategoriesRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/leaderboard': { id: '/admin/leaderboard'; path: '/leaderboard'; fullPath: '/admin/leaderboard'; preLoaderRoute: typeof AdminLeaderboardRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/jobs': { id: '/admin/jobs'; path: '/jobs'; fullPath: '/admin/jobs'; preLoaderRoute: typeof AdminJobsRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/users': { id: '/admin/users'; path: '/users'; fullPath: '/admin/users'; preLoaderRoute: typeof AdminUsersRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/blog': { id: '/admin/blog'; path: '/blog'; fullPath: '/admin/blog'; preLoaderRoute: typeof AdminBlogRouteImport; parentRoute: typeof AdminRouteImport }
    '/admin/settings': { id: '/admin/settings'; path: '/settings'; fullPath: '/admin/settings'; preLoaderRoute: typeof AdminSettingsRouteImport; parentRoute: typeof AdminRouteImport }
    '/blog/$slug': { id: '/blog/$slug'; path: '/blog/$slug'; fullPath: '/blog/$slug'; preLoaderRoute: typeof BlogSlugRouteImport; parentRoute: typeof rootRouteImport }
    '/dashboard/history': { id: '/dashboard/history'; path: '/dashboard/history'; fullPath: '/dashboard/history'; preLoaderRoute: typeof DashboardHistoryRouteImport; parentRoute: typeof rootRouteImport }
    '/jobs/$slug': { id: '/jobs/$slug'; path: '/jobs/$slug'; fullPath: '/jobs/$slug'; preLoaderRoute: typeof JobsSlugRouteImport; parentRoute: typeof rootRouteImport }
    '/quiz/$sessionId': { id: '/quiz/$sessionId'; path: '/quiz/$sessionId'; fullPath: '/quiz/$sessionId'; preLoaderRoute: typeof QuizSessionIdRouteImport; parentRoute: typeof rootRouteImport }
    '/blog/': { id: '/blog/'; path: '/blog'; fullPath: '/blog/'; preLoaderRoute: typeof BlogIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/dashboard/': { id: '/dashboard/'; path: '/dashboard'; fullPath: '/dashboard/'; preLoaderRoute: typeof DashboardIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/jobs/': { id: '/jobs/'; path: '/jobs'; fullPath: '/jobs/'; preLoaderRoute: typeof JobsIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/quiz/': { id: '/quiz/'; path: '/quiz'; fullPath: '/quiz/'; preLoaderRoute: typeof QuizIndexRouteImport; parentRoute: typeof rootRouteImport }
    '/quiz/result/$sessionId': { id: '/quiz/result/$sessionId'; path: '/quiz/result/$sessionId'; fullPath: '/quiz/result/$sessionId'; preLoaderRoute: typeof QuizResultSessionIdRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const AdminRouteWithChildren = AdminRoute._addFileChildren({
  AdminIndexRoute, AdminDashboardRoute, AdminSubscriptionsRoute, AdminSubscriptionsVerifiedRoute,
  AdminQuestionsRoute, AdminQuestionsNewRoute, AdminQuestionsIdEditRoute, AdminCategoriesRoute,
  AdminLeaderboardRoute, AdminJobsRoute, AdminUsersRoute, AdminBlogRoute, AdminSettingsRoute,
})

const rootRouteChildren = {
  IndexRoute, AboutRoute, AdminRoute: AdminRouteWithChildren, ContactRoute, FaqRoute, ForgotPasswordRoute,
  LeaderboardRoute, LoginRoute, PremiumRoute, PrivacyRoute, PrizesRoute, ProfileRoute, SignupRoute,
  SitemapDotxmlRoute, TermsRoute, BlogSlugRoute, DashboardHistoryRoute, JobsSlugRoute, QuizSessionIdRoute,
  BlogIndexRoute, DashboardIndexRoute, JobsIndexRoute, QuizIndexRoute, QuizResultSessionIdRoute,
}

export const routeTree = rootRouteImport._addFileChildren(rootRouteChildren)._addFileTypes()
