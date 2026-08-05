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
              <h1 className="text-2xl font-bold">Terms and Conditions</h1>
              <Separator />
            </div>
            <p>
              These Terms and Conditions ("Terms") govern your access to and
              use of bentoh.me (the "Service"), operated by Dev Engine, a
              French sole proprietorship (entrepreneur individuel) run by
              Alexandre Guillôme, registered under SIREN 911 591 691 (SIRET
              911 591 691 00041) ("we", "us", "Dev Engine"). By creating an
              account or using the Service, you
              agree to be bound by these Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">1. The Service</h2>
            <p>
              bentoh.me lets users create and publish personal pages,
              portfolios and link-in-bio style profiles. We may add, modify
              or remove features at any time, with or without notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              2. Eligibility and account
            </h2>
            <p>
              You must be at least 16 years old to use the Service. To use
              bentoh.me you must sign in with a Google account. You are
              responsible for maintaining the confidentiality of your
              account and for all activity that occurs under it. You agree
              to provide accurate information and to notify us promptly of
              any unauthorised use of your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              3. User-generated content
            </h2>
            <p>
              You retain ownership of all content (text, images, links) you
              upload or publish through the Service ("User Content"). By
              submitting User Content, you grant Dev Engine a worldwide,
              non-exclusive, royalty-free licence to host, store, reproduce
              and display that content solely for the purpose of operating
              and providing the Service to you and to visitors of your
              public page.
            </p>
            <p className="mt-2">
              You are solely responsible for your User Content and for
              ensuring you have all necessary rights to publish it. You must
              not upload content that is illegal, infringing, defamatory,
              hateful, obscene, or that violates the rights of any third
              party. Dev Engine is not responsible for what users do with
              user-generated content and may remove content or suspend
              accounts that violate these Terms without prior notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              4. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Use the Service for any unlawful purpose or to violate any applicable law or regulation.</li>
              <li>Attempt to gain unauthorised access to the Service, other accounts, or our systems.</li>
              <li>Interfere with or disrupt the integrity or performance of the Service.</li>
              <li>Use the Service to distribute spam, malware, or phishing content.</li>
              <li>Reverse engineer, copy or resell the Service without our written consent.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              5. Pricing
            </h2>
            <p>
              The Service is currently free to use. We reserve the right to
              introduce paid plans or premium features in the future. Should
              we do so, payments will be processed by a third-party payment
              provider, prices will be displayed before purchase, and these
              Terms will be updated accordingly with reasonable prior
              notice.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              6. Intellectual property
            </h2>
            <p>
              The Service, including its design, features, source code,
              trademarks and logos (excluding your User Content), is the
              exclusive property of Dev Engine and is protected by
              applicable intellectual property laws. Nothing in these Terms
              grants you any right to use our trademarks or branding without
              our prior written consent.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              7. Termination
            </h2>
            <p>
              You may stop using the Service and delete your account at any
              time. We may suspend or terminate your access to the Service,
              with or without notice, if you breach these Terms, if
              required by law, or if we decide to discontinue the Service.
              Upon termination, your right to use the Service ceases
              immediately; we may delete your account data in accordance
              with our Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              8. Disclaimer of warranties
            </h2>
            <p>
              The Service is provided "as is" and "as available", without
              warranty of any kind, express or implied. We do not warrant
              that the Service will be uninterrupted, error-free, or
              completely secure. To the fullest extent permitted by
              applicable law, all express and implied warranties or
              conditions not stated in these Terms are excluded and
              expressly disclaimed. This does not affect your statutory
              rights as a consumer under French law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              9. Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by applicable law, Dev Engine
              shall not be liable for any indirect, incidental, special or
              consequential damages, including loss of profits, revenue,
              data or business opportunity, arising out of or in connection
              with your use of the Service. Where liability cannot be
              excluded, Dev Engine's total liability towards you is limited
              to the amount you have paid for the Service during the twelve
              (12) months preceding the event giving rise to the claim.
              Nothing in these Terms excludes or limits liability for
              fraud, gross negligence, or death or personal injury caused
              by negligence, to the extent such exclusion is prohibited by
              applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold Dev Engine harmless from any
              claims, damages, liabilities and expenses (including
              reasonable legal fees) arising from your use of the Service,
              your User Content, or your violation of these Terms or
              applicable law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              11. Changes to these Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes
              will be notified through the Service or by email. Your
              continued use of the Service after changes take effect
              constitutes acceptance of the revised Terms.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              12. Governing law and disputes
            </h2>
            <p>
              These Terms are governed by French law, without regard to its
              conflict of law principles. Any dispute arising out of or in
              connection with these Terms shall be submitted to the
              exclusive jurisdiction of the competent French courts, unless
              mandatory consumer protection rules of your country of
              residence provide otherwise. You acknowledge that no joint
              venture, partnership, employment or agency relationship exists
              between you and Dev Engine as a result of your use of the
              Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">
              13. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be unenforceable
              or invalid, that provision shall be limited or eliminated to
              the minimum extent necessary so that the remaining Terms
              remain in full force and effect.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">14. Contact us</h2>
            <p>
              For any question regarding these Terms, contact Dev Engine /
              Alexandre Guillôme at alexandre.guillome@yucatech.fr.
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
