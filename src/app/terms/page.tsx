/* eslint-disable react/no-unescaped-entities */
// app/terms/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Xponent',
  description: 'Read the terms and conditions for using the Xponent website and services.',
};

export default function TermsPage() {
  return (
    <main className="bg-gray-50 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="bg-white max-w-4xl mx-auto p-8 md:p-12 rounded-lg shadow-md">
          
          {/* Header Section */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last Updated: August 18, 2025
            </p>
          </div>

          {/* Main Content Area */}
          <div className="prose prose-lg max-w-none text-gray-700 prose-headings:text-gray-800 prose-a:text-blue-600 hover:prose-a:text-blue-800">
            <h2>1. Agreement to Terms</h2>
            <p>
              Welcome to Design Anything Online ("Company", "we", "us", or "our"). These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and `[Your Company Name]`, concerning your access to and use of the `[www.yourwebsite.com]` website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).
            </p>
            <p>
              By accessing the Site, you agree to be bound by these Terms of Service. If you do not agree with all of these terms, then you are expressly prohibited from using the Site and you must discontinue use immediately.
            </p>

            <hr className="my-8" />

            <h2>2. Ordering and Payment Process</h2>
            <p>
              Our Site functions as a digital catalogue. The final placement of an order, customization, and payment is handled manually through the WhatsApp platform.
            </p>
            <ul>
              <li>
                <strong>Order Initiation:</strong> To purchase a product, you must initiate a conversation with us via the "Purchase on WhatsApp" link available on our product pages.
              </li>
              <li>
                <strong>Payment:</strong> All payments are to be made manually via the Unified Payments Interface (UPI) to the Virtual Payment Address (VPA) provided by our representative in the WhatsApp chat.
              </li>
              <li>
                <strong>Order Confirmation:</strong> An order is not confirmed until we have received the full payment and a valid confirmation of the transaction (such as a screenshot) from you via WhatsApp, and have explicitly acknowledged receipt.
              </li>
            </ul>

            <hr className="my-8" />

            <h2>3. User-Provided Customization Content</h2>
            <p>
              For products that require customization, you may provide us with images, text, or other content ("User Content") via WhatsApp. By providing User Content, you represent and warrant that:
            </p>
            <ul>
              <li>You are the creator and owner of or have the necessary licenses, rights, consents, releases, and permissions to use and to authorize us to use your User Content.</li>
              <li>Your User Content does not and will not infringe, misappropriate, or violate a third party’s patent, copyright, trademark, trade secret, moral rights, or other proprietary or intellectual property rights, or rights of publicity or privacy.</li>
              <li>We reserve the right to refuse any User Content that we deem inappropriate, offensive, or in violation of these terms.</li>
            </ul>

            <hr className="my-8" />

            <h2>4. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
            </p>
            
            <hr className="my-8" />

            <h2>5. Prohibited Activities</h2>
            <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
            </p>

            <hr className="my-8" />

            <h2>6. Term and Termination</h2>
            <p>
              These Terms of Service shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF SERVICE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON.
            </p>

            <hr className="my-8" />

            <h2>7. Governing Law</h2>
            <p>
              These Terms shall be governed by and defined following the laws of India. `[Your Company Name]` and yourself irrevocably consent that the courts of `[Your City, e.g., Kolkata]` shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these terms.
            </p>
            
            <hr className="my-8" />

            <h2>8. Contact Us</h2>
            <p>
              In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:
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