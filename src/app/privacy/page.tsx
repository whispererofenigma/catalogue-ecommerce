/* eslint-disable react/no-unescaped-entities */
// app/privacy/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Xponent',
  description: 'Learn how Xponent collects, uses, and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <main className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white max-w-4xl mx-auto p-8 md:p-12 rounded-lg shadow-md">
          
          {/* Header Section */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last Updated: August 18, 2025
            </p>
          </div>

          {/* Main Content Area */}
          <div className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-800">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Desing Anything Online("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, `[www.yourdomain.com]`, including any other media form, media channel, mobile website, or mobile application related or connected thereto (collectively, the "Site"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
            </p>

            <hr className="my-8" />

            <h2>2. Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site includes:
            </p>
            
            <h3>A. Information You Provide to Us</h3>
            <ul>
                <li>
                    <strong>Order Information:</strong> When you express interest in an order via WhatsApp after browsing our Site, we manually collect personal and shipping information necessary to fulfill your order, such as your full name, shipping address, email address, and phone number.
                </li>
                <li>
                    <strong>Customization Content:</strong> For customizable products, you may send us images, text, or other content ("User Content") directly via WhatsApp. This User Content is used solely for the purpose of creating your custom product.
                </li>
                
            </ul>
            
            <h3>B. Information We Collect Automatically</h3>
            <ul>
                <li>
                    <strong>Log and Usage Data:</strong> Our hosting provider, Vercel, may collect standard log information, including your IP address, browser type, operating system, access times, and pages viewed. This data is used for analytics and to maintain the security of our services.
                </li>
            </ul>

            <hr className="my-8" />

            <h2>3. How We Use Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
            </p>
            <ul>
                <li>Fulfill and manage your orders.</li>
                <li>Create and apply your custom designs to products.</li>
                <li>Communicate with you regarding your order, including payment confirmation and shipping updates.</li>
                <li>Monitor and analyze usage and trends to improve your experience with the Site.</li>
                <li>Maintain the security and operation of our Site.</li>
            </ul>

            {/* ... Add other sections similarly with <hr /> separators ... */}

            <hr className="my-8" />

            <h2>9. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded-md not-prose">
              <p className="font-semibold">Design Anything Online</p>
              <p>Kolkata, West Bengal, India</p>
              <a href="mailto:support@designanything.online" className="text-blue-600 hover:underline">
                support@designanything.online
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}