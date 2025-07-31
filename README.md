# RecruitMyGame - Athletic Recruiting Platform

## Overview

RecruitMyGame is a comprehensive web platform designed to help student-athletes create professional recruiting profiles to showcase their athletic abilities, academic achievements, and character to college coaches and scouts. The platform provides a complete solution for athletic recruitment with customizable profiles, media galleries, verified reviews, and advanced features for serious athletes.

## 🎯 Mission

To democratize athletic recruiting by providing every student-athlete with the tools they need to showcase their complete story and connect with college opportunities, regardless of their background or resources.

## ✨ Key Features

### Core Profile Features
- **Professional Athlete Profiles**: Comprehensive profiles with personal information, athletic stats, and academic achievements
- **Custom Subdomains**: Pro users get personalized URLs (e.g., `johnsmith.recruitmygame.com`)
- **Multi-Sport Support**: Pro users can showcase multiple sports and positions
- **Responsive Design**: Optimized for all devices - desktop, tablet, and mobile

### Media & Content Management
- **Photo Galleries**: Upload and organize action shots, team photos, and achievements
- **Video Integration**: Support for YouTube, Vimeo, and direct uploads with automatic thumbnail generation
- **Hero Images**: Custom hero backgrounds with gender-specific defaults
- **Content Ordering**: Drag-and-drop interface to customize profile section order

### Athletic Data
- **Team Management**: Track current and past teams with stats, positions, and seasons
- **Awards & Achievements**: Showcase honors, championships, and recognitions with award types
- **Schedule Management**: Display upcoming games, tournaments, and showcases
- **Athletic Statistics**: Comprehensive stats tracking with sport-specific metrics

### Social Proof & Reviews
- **Coach Reviews**: Verified testimonials from coaches and mentors
- **Verified Review System**: Email-verified reviews with authentication tokens
- **Contact Integration**: Direct contact forms for coaches to reach athletes
- **Social Media Links**: Integration with Instagram, Twitter, TikTok, and more

### Advanced Features (Pro/Premium)
- **Business Card Generation**: Canva integration for professional recruiting cards
- **Analytics Dashboard**: Track profile views and engagement (Pro)
- **Custom Theming**: Personalized colors and branding
- **Priority Support**: Dedicated customer service for premium users

### Communication Tools
- **Contact Forms**: Secure messaging system for coach-athlete communication
- **Support Ticketing**: Integrated help desk with priority levels
- **Email Notifications**: Automated updates and confirmations
- **Review Request System**: Streamlined process for requesting coach reviews

## 🏗️ Technical Architecture

### Frontend Technologies
- **Next.js 14**: React framework with App Router for optimal performance
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Chakra UI**: Component library for consistent, accessible design
- **Framer Motion**: Smooth animations and transitions
- **Responsive Design**: Mobile-first approach with breakpoint optimization

### Backend & Database
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Row Level Security (RLS)**: Secure data access with user-based permissions
- **Database Functions**: Custom PostgreSQL functions for complex operations
- **File Storage**: Supabase Storage for images, videos, and documents

### Authentication & Security
- **Supabase Auth**: Secure user authentication with email/password
- **JWT Tokens**: Stateless authentication with automatic token refresh
- **Data Protection**: GDPR-compliant data handling and user privacy controls
- **Audit Logging**: Comprehensive activity tracking for security and compliance

### Payment & Subscriptions
- **Stripe Integration**: Secure payment processing with webhook handling
- **Subscription Management**: Automated billing with tier-based feature access
- **Customer Portal**: Self-service subscription management
- **Usage Tracking**: Feature usage monitoring and limits enforcement

### Third-Party Integrations
- **Canva API**: Business card generation and design tools
- **Resend**: Transactional email delivery with templates
- **Video Services**: YouTube and Vimeo embedding with metadata extraction
- **Social Media**: Profile linking and content integration

## 📊 Subscription Tiers

### Free Tier
- Basic profile creation
- Up to 5 photos
- Team management
- Public profile access
- Basic support

### Premium Tier ($9.99/month)
- Up to 20 photos
- 5 videos
- Awards and achievements
- Schedule management
- Coach reviews
- Custom theming
- Email support

### Pro Tier ($19.99/month)
- Unlimited photos and videos
- Multiple sports support
- Custom subdomain
- Business card generation
- Verified reviews
- Analytics dashboard
- Priority support
- Advanced customization

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Stripe account for payments
- Canva Developer account (optional)

### Environment Variables
\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Subscription Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_xxx
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_xxx

# Canva Integration (Optional)
CANVA_CLIENT_ID=your_canva_client_id
CANVA_CLIENT_SECRET=your_canva_client_secret
CANVA_REDIRECT_URI=your_canva_redirect_uri

# Email Configuration
RESEND_API_KEY=your_resend_api_key

# Application URLs
NEXT_PUBLIC_SITE_URL=https://recruitmygame.com
VERCEL_URL=your_vercel_deployment_url
\`\`\`

### Installation & Setup
\`\`\`bash
# Clone the repository
git clone https://github.com/your-org/recruitmygame.git
cd recruitmygame

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
\`\`\`

### Database Setup
The project includes SQL migration scripts in the `scripts/` directory:

\`\`\`bash
# Core tables and functions
scripts/create-athletes-table.sql
scripts/create-subscription-tables.sql
scripts/add-verified-reviews-system.sql
scripts/add-data-protection-compliance.sql

# Feature-specific migrations
scripts/add-sport-positions-mapping.sql
scripts/add-subdomain-field.sql
scripts/create-business-cards-table.sql
\`\`\`

## 🏃‍♂️ Getting Started

### For Athletes
1. **Sign Up**: Create your free account at recruitmygame.com
2. **Build Profile**: Add your athletic information, stats, and photos
3. **Customize**: Choose your theme colors and organize your content
4. **Share**: Use your custom URL to share with coaches and scouts
5. **Upgrade**: Access premium features as your recruiting intensifies

### For Coaches
1. **Discover**: Browse athlete profiles by sport, location, and graduation year
2. **Connect**: Use contact forms to reach out to promising athletes
3. **Verify**: Provide verified reviews for athletes you've coached
4. **Track**: Monitor your recruiting pipeline and communications

## 🔧 Key Components

### Profile Management
- `src/app/dashboard/profile/page.tsx` - Profile editing interface
- `src/components/profile/` - Public profile display components
- `src/app/[athleteName]/page.tsx` - Dynamic public profile pages

### Media Management
- `src/app/dashboard/photos/page.tsx` - Photo upload and management
- `src/app/dashboard/videos/page.tsx` - Video integration and playlists
- `src/components/PhotoUpload.tsx` - Drag-and-drop photo uploads

### Review System
- `src/components/profile/ReviewsSection.tsx` - Review display
- `src/app/verify-review/[token]/page.tsx` - Review verification
- `src/utils/verifiedReviews.ts` - Review management utilities

### Subscription Management
- `src/components/SubscriptionPlans.tsx` - Pricing and plan selection
- `src/app/api/stripe/` - Stripe webhook and payment handling
- `src/utils/tierFeatures.ts` - Feature access control

## 📱 Mobile Optimization

The platform is fully responsive with mobile-first design principles:

- **Adaptive Layouts**: Components automatically adjust for screen size
- **Touch-Friendly**: Large touch targets and gesture support
- **Performance**: Optimized images and lazy loading
- **Navigation**: Mobile drawer navigation with hamburger menu
- **Forms**: Mobile-optimized form inputs and validation

## 🔒 Security & Privacy

### Data Protection
- **GDPR Compliance**: User consent management and data export tools
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Access Controls**: Role-based permissions and row-level security
- **Audit Trails**: Comprehensive logging of user actions and data changes

### Privacy Features
- **Profile Visibility**: Granular control over public/private content
- **Contact Preferences**: User-controlled communication settings
- **Data Deletion**: Complete account and data removal options
- **Consent Management**: Granular consent for different data uses

## 🚀 Deployment

### Vercel Deployment (Recommended)
\`\`\`bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# Configure custom domain and SSL
\`\`\`

### Environment Configuration
- **Production**: Configure all environment variables in deployment platform
- **Database**: Set up Supabase production instance with proper RLS policies
- **CDN**: Configure image optimization and caching
- **Monitoring**: Set up error tracking and performance monitoring

## 📈 Analytics & Monitoring

### Built-in Analytics (Pro Feature)
- Profile view tracking
- Engagement metrics
- Contact form submissions
- Geographic visitor data

### Performance Monitoring
- Core Web Vitals tracking
- Error boundary reporting
- Database query optimization
- Image loading performance

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes with clear messages
4. **Test** thoroughly across devices and browsers
5. **Submit** a pull request with detailed description

### Development Guidelines
- Follow TypeScript best practices
- Maintain responsive design principles
- Write comprehensive tests
- Update documentation for new features
- Follow accessibility standards (WCAG 2.1)

## 📞 Support

### For Users
- **Help Center**: In-app support documentation
- **Contact Form**: Direct support requests
- **Email**: support@recruitmygame.com
- **Priority Support**: Available for Pro subscribers

### For Developers
- **Documentation**: Comprehensive API and component docs
- **GitHub Issues**: Bug reports and feature requests
- **Community**: Developer Discord server
- **Enterprise**: Custom development and integration services

## 📄 License

This project is proprietary software. All rights reserved.

## 🙏 Acknowledgments

Built with love for student-athletes everywhere. Special thanks to:
- The open-source community for amazing tools and libraries
- Beta testers and early adopters for valuable feedback
- Coaches and athletes who inspired this platform
- Contributors who helped make this vision a reality

---

**RecruitMyGame** - Empowering the next generation of student-athletes to showcase their complete story and achieve their college dreams.
