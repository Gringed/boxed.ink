import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { Section } from "@/features/landing/Section";
import Footer from "@/features/landing/Footer";
import React from "react";

const page = () => {
  return (
    <>
      <LandingHeader />
      <div className="flex flex-col w-full">
        <Section className="flex flex-col items-start text-medium text-justify py-10 w-full gap-6">
          <div className="w-full">
            <div className="mb-5 flex gap-3 flex-col">
              <h1 className="text-2xl font-bold">Privacy Policy</h1>
              <Separator />
            </div>
            <p>
              This Privacy Policy explains how Dev Engine ("we", "us", "our")
              collects, uses, discloses and protects your personal data when
              you use bentoh.me (the "Service"). We are committed to
              protecting your privacy and complying with the EU General Data
              Protection Regulation (GDPR) and the French Data Protection Act.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              1. Who is responsible for your data
            </h2>
            <p>
              The data controller for bentoh.me is Dev Engine, a French sole
              proprietorship (entrepreneur individuel) operated by Alexandre
              Guillôme.
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Trading name: Dev Engine</li>
              <li>Legal representative: Alexandre Guillôme</li>
              <li>SIREN: 911 591 691</li>
              <li>SIRET: 911 591 691 00041</li>
              <li>VAT number: FR56911591691</li>
              <li>Contact email: alexandre.guillome@yucatech.fr</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              2. What personal data we collect
            </h2>
            <p>We collect and process the following categories of data:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>
                <strong>Account data:</strong> your name, email address and
                profile picture, provided by Google when you sign in with
                Google OAuth.
              </li>
              <li>
                <strong>Profile and content data:</strong> the text, links,
                images and other content you add to your bentoh.me page(s).
              </li>
              <li>
                <strong>Technical data:</strong> IP address, browser type,
                device information and usage data collected automatically
                when you use the Service, including through cookies (see
                Section 7).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              3. Why we process your data
            </h2>
            <ul className="list-disc pl-6 mt-2">
              <li>To create and manage your account (contract performance).</li>
              <li>To provide, operate and maintain the Service, including hosting your public page(s).</li>
              <li>To communicate with you about service updates, security or support requests.</li>
              <li>To detect, prevent and address fraud, abuse or technical issues (legitimate interest).</li>
              <li>To comply with our legal and accounting obligations.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              4. Who we share your data with
            </h2>
            <p>
              We do not sell your personal data. We share data only with
              service providers ("subprocessors") strictly necessary to
              operate bentoh.me, and only to the extent required:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li><strong>Google</strong> – authentication (Sign in with Google).</li>
              <li><strong>Vercel</strong> – application hosting and infrastructure.</li>
              <li><strong>MongoDB</strong> – database storage of your account and content data.</li>
            </ul>
            <p className="mt-2">
              Some of these providers may process data outside the European
              Economic Area. Where this is the case, we ensure appropriate
              safeguards are in place (such as Standard Contractual Clauses)
              as required by GDPR. We may also disclose data if required to
              do so by law or to protect our rights.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              5. How long we keep your data
            </h2>
            <p>
              We retain your account and content data for as long as your
              account is active. If you delete your account, we delete or
              anonymise your personal data within a reasonable period,
              except where we are required to keep certain information
              (e.g. billing records) to comply with legal, accounting or tax
              obligations, typically for up to 10 years for invoicing data.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">6. Data security</h2>
            <p>
              We implement commercially reasonable technical and
              organisational measures to protect your data against loss,
              theft, unauthorised access, disclosure, alteration or
              destruction. No method of transmission or storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">7. Cookies</h2>
            <p>
              We use essential cookies required for authentication and the
              core functioning of the Service. We may also use analytics
              cookies to understand how the Service is used and improve it.
              You can control cookies through your browser settings; note
              that blocking essential cookies may prevent you from signing
              in or using certain features.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              8. Your rights under GDPR
            </h2>
            <p>If you are located in the EEA or UK, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Access the personal data we hold about you.</li>
              <li>Rectify inaccurate or incomplete data.</li>
              <li>Request erasure of your data ("right to be forgotten").</li>
              <li>Restrict or object to certain processing.</li>
              <li>Receive your data in a portable format.</li>
              <li>Withdraw consent at any time, where processing is based on consent.</li>
              <li>
                Lodge a complaint with your local data protection authority
                (in France, the CNIL – www.cnil.fr).
              </li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at
              alexandre.guillome@yucatech.fr. We will respond within one
              month as required by GDPR.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">9. Children</h2>
            <p>
              The Service is not directed at children under 16. We do not
              knowingly collect personal data from children under 16. If you
              believe a child has provided us with personal data, please
              contact us so we can delete it.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              10. External links
            </h2>
            <p>
              Our website may link to external sites that are not operated
              by us. We have no control over the content and practices of
              these sites and cannot accept responsibility or liability for
              their respective privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              11. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be notified through the Service or by email.
              Continued use of the Service after changes take effect
              constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">12. Contact us</h2>
            <p>
              For any question about this Privacy Policy or how we handle
              your personal data, contact Dev Engine / Alexandre Guillôme at
              alexandre.guillome@yucatech.fr.
            </p>
          </div>

          <p>Last updated: 5 August 2026.</p>
        </Section>
      </div>
      <Footer />
    </>
  );
};

export default page;
