import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, tw } from '../../lib/theme';

/** Tailwind v4 shades used on the web page but not in lib/theme's tw palette. */
const BLUE_400 = '#51a2ff'; // text-blue-400
const NEUTRAL_600 = '#525252'; // text-neutral-600

function LinkText({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <Text style={styles.link} onPress={() => Linking.openURL(url)}>
      {children}
    </Text>
  );
}

/** In-page anchor links from the web page (no page to jump to on mobile). */
function Anchor({ children }: { children: React.ReactNode }) {
  return <Text style={styles.anchor}>{children}</Text>;
}

function Bullet({ children, tight }: { children: React.ReactNode; tight?: boolean }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={tight ? styles.listText : styles.p}>•</Text>
      <Text style={[tight ? styles.listText : styles.p, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

function TocItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.listText}>{n}.</Text>
      <Text style={[styles.listText, { flex: 1 }]}>
        <Anchor>{children}</Anchor>
      </Text>
    </View>
  );
}

/** 1:1 port of app/privacy-policy/page.tsx. */
export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: insets.top + 48,
        paddingBottom: insets.bottom + 48,
      }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.h1}>Privacy Policy</Text>
          <Text style={styles.lastUpdated}>Last updated March 13, 2026</Text>
        </View>

        {/* Intro */}
        <View style={styles.section}>
          <Text style={styles.p}>
            This Privacy Notice for Loki (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
            describes how and why we might access, collect, store, use, and/or share
            (&quot;process&quot;) your personal information when you use our services
            (&quot;Services&quot;), including when you:
          </Text>
          <View style={styles.list}>
            <Bullet>
              Visit our website at{' '}
              <LinkText url="http://lokidxb.com/">http://lokidxb.com/</LinkText> or any website of
              ours that links to this Privacy Notice
            </Bullet>
            <Bullet>
              Use Loki. Social planning app for discovering, curating, and sharing places to go
              out. Currently focused on Dubai
            </Bullet>
            <Bullet>
              Engage with us in other related ways, including any marketing or events
            </Bullet>
          </View>
          <Text style={styles.p}>
            <Text style={styles.strong}>Questions or concerns?</Text> Reading this Privacy Notice
            will help you understand your privacy rights and choices. We are responsible for making
            decisions about how your personal information is processed. If you do not agree with
            our policies and practices, please do not use our Services.
          </Text>
        </View>

        {/* Summary of Key Points */}
        <View style={styles.section}>
          <Text style={styles.h2}>Summary of Key Points</Text>
          <Text style={[styles.p, styles.em]}>
            This summary provides key points from our Privacy Notice, but you can find out more
            details about any of these topics by clicking the link following each key point or by
            using our table of contents below to find the section you are looking for.
          </Text>
          <View style={styles.subBlock}>
            <Text style={styles.p}>
              <Text style={styles.strong}>What personal information do we process?</Text> When you
              visit, use, or navigate our Services, we may process personal information depending
              on how you interact with us and the Services, the choices you make, and the products
              and features you use. Learn more about{' '}
              <Anchor>personal information you disclose to us</Anchor>.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>Do we process any sensitive personal information?</Text>{' '}
              We do not process sensitive personal information.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>Do we collect any information from third parties?</Text>{' '}
              We do not collect any information from third parties.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>How do we process your information?</Text> We process
              your information to provide, improve, and administer our Services, communicate with
              you, for security and fraud prevention, and to comply with law. We may also process
              your information for other purposes with your consent. Learn more about{' '}
              <Anchor>how we process your information</Anchor>.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>
                In what situations and with which parties do we share personal information?
              </Text>{' '}
              We may share information in specific situations and with specific third parties.
              Learn more about <Anchor>when and with whom we share your personal information</Anchor>
              .
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>How do we keep your information safe?</Text> We have
              adequate organizational and technical processes and procedures in place to protect
              your personal information. However, no electronic transmission over the internet or
              information storage technology can be guaranteed to be 100% secure, so we cannot
              promise or guarantee that hackers, cybercriminals, or other unauthorized third
              parties will not be able to defeat our security and improperly collect, access,
              steal, or modify your information. Learn more about{' '}
              <Anchor>how we keep your information safe</Anchor>.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>What are your rights?</Text> Depending on where you are
              located geographically, the applicable privacy law may mean you have certain rights
              regarding your personal information. Learn more about{' '}
              <Anchor>your privacy rights</Anchor>.
            </Text>
            <Text style={styles.p}>
              <Text style={styles.strong}>How do you exercise your rights?</Text> The easiest way
              to exercise your rights is by visiting{' '}
              <LinkText url="http://lokidxb.com/">http://lokidxb.com/</LinkText>, or by contacting
              us. We will consider and act upon any request in accordance with applicable data
              protection laws.
            </Text>
            <Text style={styles.p}>
              Want to learn more about what we do with any information we collect?{' '}
              <Anchor>Review the Privacy Notice in full</Anchor>.
            </Text>
          </View>
        </View>

        {/* Table of Contents */}
        <View style={styles.subBlock}>
          <Text style={styles.h2}>Table of Contents</Text>
          <View style={styles.list}>
            <TocItem n={1}>WHAT INFORMATION DO WE COLLECT?</TocItem>
            <TocItem n={2}>HOW DO WE PROCESS YOUR INFORMATION?</TocItem>
            <TocItem n={3}>WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</TocItem>
            <TocItem n={4}>DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</TocItem>
            <TocItem n={5}>HOW DO WE HANDLE YOUR SOCIAL LOGINS?</TocItem>
            <TocItem n={6}>HOW LONG DO WE KEEP YOUR INFORMATION?</TocItem>
            <TocItem n={7}>HOW DO WE KEEP YOUR INFORMATION SAFE?</TocItem>
            <TocItem n={8}>WHAT ARE YOUR PRIVACY RIGHTS?</TocItem>
            <TocItem n={9}>CONTROLS FOR DO-NOT-TRACK FEATURES</TocItem>
            <TocItem n={10}>DO WE MAKE UPDATES TO THIS NOTICE?</TocItem>
            <TocItem n={11}>HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</TocItem>
            <TocItem n={12}>HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</TocItem>
          </View>
        </View>

        {/* 1. What Information Do We Collect? */}
        <View style={styles.section}>
          <Text style={styles.h2}>1. What Information Do We Collect?</Text>

          <Text style={styles.h3}>Personal information you disclose to us</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>We collect personal information that you provide to us.</Text>
          </Text>
          <Text style={styles.p}>
            We collect personal information that you voluntarily provide to us when you register on
            the Services, express an interest in obtaining information about us or our products and
            Services, when you participate in activities on the Services, or otherwise when you
            contact us.
          </Text>
          <Text style={styles.p}>
            <Text style={styles.strong}>Personal Information Provided by You.</Text> The personal
            information that we collect depends on the context of your interactions with us and the
            Services, the choices you make, and the products and features you use. The personal
            information we collect may include the following:
          </Text>
          <View style={styles.list}>
            <Bullet tight>Names</Bullet>
            <Bullet tight>Email addresses</Bullet>
            <Bullet tight>Contact or authentication data</Bullet>
          </View>
          <Text style={styles.p}>
            <Text style={styles.strong}>Sensitive Information.</Text> We do not process sensitive
            information.
          </Text>
          <Text style={styles.p}>
            <Text style={styles.strong}>Social Media Login Data.</Text> We may provide you with the
            option to register with us using your existing social media account details, like your
            Facebook, X, or other social media account. If you choose to register in this way, we
            will collect certain profile information about you from the social media provider, as
            described in the section called{' '}
            <Anchor>&quot;HOW DO WE HANDLE YOUR SOCIAL LOGINS?&quot;</Anchor> below.
          </Text>
          <Text style={styles.p}>
            All personal information that you provide to us must be true, complete, and accurate,
            and you must notify us of any changes to such personal information.
          </Text>

          <Text style={styles.h3}>Information automatically collected</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              Some information — such as your Internet Protocol (IP) address and/or browser and
              device characteristics — is collected automatically when you visit our Services.
            </Text>
          </Text>
          <Text style={styles.p}>
            We automatically collect certain information when you visit, use, or navigate the
            Services. This information does not reveal your specific identity (like your name or
            contact information) but may include device and usage information, such as your IP
            address, browser and device characteristics, operating system, language preferences,
            referring URLs, device name, country, location, information about how and when you use
            our Services, and other technical information. This information is primarily needed to
            maintain the security and operation of our Services, and for our internal analytics and
            reporting purposes.
          </Text>
          <Text style={styles.p}>
            Like many businesses, we also collect information through cookies and similar
            technologies. You can find out more about this in our Cookie Notice:{' '}
            <LinkText url="http://lokidxb.com/cookie-policy">
              http://lokidxb.com/cookie-policy
            </LinkText>
            .
          </Text>
          <Text style={styles.p}>The information we collect includes:</Text>
          <View style={styles.listLoose}>
            <Bullet tight>
              <Text style={styles.em}>Log and Usage Data.</Text> Log and usage data is
              service-related, diagnostic, usage, and performance information our servers
              automatically collect when you access or use our Services and which we record in log
              files. Depending on how you interact with us, this log data may include your IP
              address, device information, browser type, and settings and information about your
              activity in the Services (such as the date/time stamps associated with your usage,
              pages and files viewed, searches, and other actions you take such as which features
              you use), device event information (such as system activity, error reports (sometimes
              called &quot;crash dumps&quot;), and hardware settings).
            </Bullet>
            <Bullet tight>
              <Text style={styles.em}>Location Data.</Text> We collect location data such as
              information about your device&apos;s location, which can be either precise or
              imprecise. How much information we collect depends on the type and settings of the
              device you use to access the Services. For example, we may use GPS and other
              technologies to collect geolocation data that tells us your current location (based
              on your IP address). You can opt out of allowing us to collect this information
              either by refusing access to the information or by disabling your Location setting on
              your device. However, if you choose to opt out, you may not be able to use certain
              aspects of the Services.
            </Bullet>
          </View>

          <Text style={styles.h3}>Google API</Text>
          <Text style={styles.p}>
            Our use of information received from Google APIs will adhere to{' '}
            <LinkText url="https://developers.google.com/terms/api-services-user-data-policy">
              Google API Services User Data Policy
            </LinkText>
            , including the{' '}
            <LinkText url="https://developers.google.com/terms/api-services-user-data-policy#limited-use">
              Limited Use requirements
            </LinkText>
            .
          </Text>
        </View>

        {/* 2. How Do We Process Your Information? */}
        <View style={styles.section}>
          <Text style={styles.h2}>2. How Do We Process Your Information?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              We process your information to provide, improve, and administer our Services,
              communicate with you, for security and fraud prevention, and to comply with law. We
              may also process your information for other purposes with your consent.
            </Text>
          </Text>
          <Text style={styles.p}>
            <Text style={styles.strong}>
              We process your personal information for a variety of reasons, depending on how you
              interact with our Services, including:
            </Text>
          </Text>
          <View style={styles.listLoose}>
            <Bullet tight>
              <Text style={styles.strong}>
                To facilitate account creation and authentication and otherwise manage user
                accounts.
              </Text>{' '}
              We may process your information so you can create and log in to your account, as well
              as keep your account in working order.
            </Bullet>
            <Bullet tight>
              <Text style={styles.strong}>
                To deliver and facilitate delivery of services to the user.
              </Text>{' '}
              We may process your information to provide you with the requested service.
            </Bullet>
            <Bullet tight>
              <Text style={styles.strong}>
                To respond to user inquiries/offer support to users.
              </Text>{' '}
              We may process your information to respond to your inquiries and solve any potential
              issues you might have with the requested service.
            </Bullet>
            <Bullet tight>
              <Text style={styles.strong}>To protect our Services.</Text> We may process your
              information as part of our efforts to keep our Services safe and secure, including
              fraud monitoring and prevention.
            </Bullet>
            <Bullet tight>
              <Text style={styles.strong}>
                To evaluate and improve our Services, products, marketing, and your experience.
              </Text>{' '}
              We may process your information when we believe it is necessary to identify usage
              trends, determine the effectiveness of our promotional campaigns, and to evaluate and
              improve our Services, products, marketing, and your experience.
            </Bullet>
            <Bullet tight>
              <Text style={styles.strong}>To identify usage trends.</Text> We may process
              information about how you use our Services to better understand how they are being
              used so we can improve them.
            </Bullet>
          </View>
        </View>

        {/* 3. When and With Whom Do We Share Your Personal Information? */}
        <View style={styles.section}>
          <Text style={styles.h2}>
            3. When and With Whom Do We Share Your Personal Information?
          </Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              We may share information in specific situations described in this section and/or with
              the following third parties.
            </Text>
          </Text>
          <Text style={styles.p}>
            We may need to share your personal information in the following situations:
          </Text>
          <View style={styles.listLoose}>
            <Bullet tight>
              <Text style={styles.strong}>Business Transfers.</Text> We may share or transfer your
              information in connection with, or during negotiations of, any merger, sale of
              company assets, financing, or acquisition of all or a portion of our business to
              another company.
            </Bullet>
          </View>
        </View>

        {/* 4. Do We Use Cookies and Other Tracking Technologies? */}
        <View style={styles.section}>
          <Text style={styles.h2}>4. Do We Use Cookies and Other Tracking Technologies?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              We may use cookies and other tracking technologies to collect and store your
              information.
            </Text>
          </Text>
          <Text style={styles.p}>
            We may use cookies and similar tracking technologies (like web beacons and pixels) to
            gather information when you interact with our Services. Some online tracking
            technologies help us maintain the security of our Services and your account, prevent
            crashes, fix bugs, save your preferences, and assist with basic site functions.
          </Text>
          <Text style={styles.p}>
            We also permit third parties and service providers to use online tracking technologies
            on our Services for analytics and advertising, including to help manage and display
            advertisements, to tailor advertisements to your interests, or to send abandoned
            shopping cart reminders (depending on your communication preferences). The third
            parties and service providers use their technology to provide advertising about
            products and services tailored to your interests which may appear either on our
            Services or on other websites.
          </Text>
          <Text style={styles.p}>
            Specific information about how we use such technologies and how you can refuse certain
            cookies is set out in our Cookie Notice:{' '}
            <LinkText url="http://lokidxb.com/cookie-policy">
              http://lokidxb.com/cookie-policy
            </LinkText>
            .
          </Text>
        </View>

        {/* 5. How Do We Handle Your Social Logins? */}
        <View style={styles.section}>
          <Text style={styles.h2}>5. How Do We Handle Your Social Logins?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              If you choose to register or log in to our Services using a social media account, we
              may have access to certain information about you.
            </Text>
          </Text>
          <Text style={styles.p}>
            Our Services offer you the ability to register and log in using your third-party social
            media account details (like your Facebook or X logins). Where you choose to do this, we
            will receive certain profile information about you from your social media provider. The
            profile information we receive may vary depending on the social media provider
            concerned, but will often include your name, email address, friends list, and profile
            picture, as well as other information you choose to make public on such a social media
            platform.
          </Text>
          <Text style={styles.p}>
            We will use the information we receive only for the purposes that are described in this
            Privacy Notice or that are otherwise made clear to you on the relevant Services. Please
            note that we do not control, and are not responsible for, other uses of your personal
            information by your third-party social media provider. We recommend that you review
            their privacy notice to understand how they collect, use, and share your personal
            information, and how you can set your privacy preferences on their sites and apps.
          </Text>
        </View>

        {/* 6. How Long Do We Keep Your Information? */}
        <View style={styles.section}>
          <Text style={styles.h2}>6. How Long Do We Keep Your Information?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              We keep your information for as long as necessary to fulfill the purposes outlined in
              this Privacy Notice unless otherwise required by law.
            </Text>
          </Text>
          <Text style={styles.p}>
            We will only keep your personal information for as long as it is necessary for the
            purposes set out in this Privacy Notice, unless a longer retention period is required
            or permitted by law (such as tax, accounting, or other legal requirements). No purpose
            in this notice will require us keeping your personal information for longer than the
            period of time in which users have an account with us.
          </Text>
          <Text style={styles.p}>
            When we have no ongoing legitimate business need to process your personal information,
            we will either delete or anonymize such information, or, if this is not possible (for
            example, because your personal information has been stored in backup archives), then we
            will securely store your personal information and isolate it from any further
            processing until deletion is possible.
          </Text>
        </View>

        {/* 7. How Do We Keep Your Information Safe? */}
        <View style={styles.section}>
          <Text style={styles.h2}>7. How Do We Keep Your Information Safe?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              We aim to protect your personal information through a system of organizational and
              technical security measures.
            </Text>
          </Text>
          <Text style={styles.p}>
            We have implemented appropriate and reasonable technical and organizational security
            measures designed to protect the security of any personal information we process.
            However, despite our safeguards and efforts to secure your information, no electronic
            transmission over the Internet or information storage technology can be guaranteed to
            be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or
            other unauthorized third parties will not be able to defeat our security and improperly
            collect, access, steal, or modify your information. Although we will do our best to
            protect your personal information, transmission of personal information to and from our
            Services is at your own risk. You should only access the Services within a secure
            environment.
          </Text>
        </View>

        {/* 8. What Are Your Privacy Rights? */}
        <View style={styles.section}>
          <Text style={styles.h2}>8. What Are Your Privacy Rights?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              You may review, change, or terminate your account at any time, depending on your
              country, province, or state of residence.
            </Text>
          </Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.underline]}>Withdrawing your consent:</Text> If we
            are relying on your consent to process your personal information, which may be express
            and/or implied consent depending on the applicable law, you have the right to withdraw
            your consent at any time. You can withdraw your consent at any time by contacting us by
            using the contact details provided in the section{' '}
            <Anchor>&quot;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&quot;</Anchor> below.
          </Text>
          <Text style={styles.p}>
            However, please note that this will not affect the lawfulness of the processing before
            its withdrawal nor, when applicable law allows, will it affect the processing of your
            personal information conducted in reliance on lawful processing grounds other than
            consent.
          </Text>

          <Text style={styles.h3}>Account Information</Text>
          <Text style={styles.p}>
            If you would at any time like to review or change the information in your account or
            terminate your account, you can:
          </Text>
          <View style={styles.list}>
            <Bullet tight>
              Log in to your account settings and update your user account.
            </Bullet>
          </View>
          <Text style={styles.p}>
            Upon your request to terminate your account, we will deactivate or delete your account
            and information from our active databases. However, we may retain some information in
            our files to prevent fraud, troubleshoot problems, assist with any investigations,
            enforce our legal terms and/or comply with applicable legal requirements.
          </Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.underline]}>
              Cookies and similar technologies:
            </Text>{' '}
            Most Web browsers are set to accept cookies by default. If you prefer, you can usually
            choose to set your browser to remove cookies and to reject cookies. If you choose to
            remove cookies or reject cookies, this could affect certain features or services of our
            Services. For further information, please see our Cookie Notice:{' '}
            <LinkText url="http://lokidxb.com/cookie-policy">
              http://lokidxb.com/cookie-policy
            </LinkText>
            .
          </Text>
        </View>

        {/* 9. Controls for Do-Not-Track Features */}
        <View style={styles.section}>
          <Text style={styles.h2}>9. Controls for Do-Not-Track Features</Text>
          <Text style={styles.p}>
            Most web browsers and some mobile operating systems and mobile applications include a
            Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to signal your
            privacy preference not to have data about your online browsing activities monitored and
            collected. At this stage, no uniform technology standard for recognizing and
            implementing DNT signals has been finalized. As such, we do not currently respond to
            DNT browser signals or any other mechanism that automatically communicates your choice
            not to be tracked online. If a standard for online tracking is adopted that we must
            follow in the future, we will inform you about that practice in a revised version of
            this Privacy Notice.
          </Text>
        </View>

        {/* 10. Do We Make Updates to This Notice? */}
        <View style={styles.section}>
          <Text style={styles.h2}>10. Do We Make Updates to This Notice?</Text>
          <Text style={styles.p}>
            <Text style={[styles.strong, styles.em]}>In Short:</Text>{' '}
            <Text style={styles.em}>
              Yes, we will update this notice as necessary to stay compliant with relevant laws.
            </Text>
          </Text>
          <Text style={styles.p}>
            We may update this Privacy Notice from time to time. The updated version will be
            indicated by an updated &quot;Revised&quot; date at the top of this Privacy Notice. If
            we make material changes to this Privacy Notice, we may notify you either by
            prominently posting a notice of such changes or by directly sending you a notification.
            We encourage you to review this Privacy Notice frequently to be informed of how we are
            protecting your information.
          </Text>
        </View>

        {/* 11. How Can You Contact Us About This Notice? */}
        <View style={styles.section}>
          <Text style={styles.h2}>11. How Can You Contact Us About This Notice?</Text>
          <Text style={styles.p}>
            If you have questions or comments about this notice, you may email us at{' '}
            <LinkText url="mailto:sales.loki.ai@gmail.com">sales.loki.ai@gmail.com</LinkText> or
            contact us by post at:
          </Text>
          <Text style={[styles.p, { color: tw.neutral400 }]}>Loki</Text>
        </View>

        {/* 12. How Can You Review, Update, or Delete the Data We Collect From You? */}
        <View style={styles.section}>
          <Text style={styles.h2}>
            12. How Can You Review, Update, or Delete the Data We Collect From You?
          </Text>
          <Text style={styles.p}>
            Based on the applicable laws of your country, you may have the right to request access
            to the personal information we collect from you, details about how we have processed
            it, correct inaccuracies, or delete your personal information. You may also have the
            right to withdraw your consent to our processing of your personal information. These
            rights may be limited in some circumstances by applicable law. To request to review,
            update, or delete your personal information, please visit:{' '}
            <LinkText url="http://lokidxb.com/">http://lokidxb.com/</LinkText>.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Privacy Policy was created using Termly&apos;s{' '}
            <LinkText url="https://termly.io/products/privacy-policy-generator/">
              Privacy Policy Generator
            </LinkText>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    maxWidth: 768,
    alignSelf: 'center',
    width: '100%',
    gap: 32,
  },
  header: {
    gap: 8,
  },
  h1: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.sansBold,
    letterSpacing: -0.5,
    color: colors.foreground,
  },
  lastUpdated: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
  },
  section: {
    gap: 16,
  },
  subBlock: {
    gap: 12,
  },
  h2: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: fonts.sansSemiBold,
    color: colors.white,
  },
  h3: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.sansSemiBold,
    color: colors.white,
  },
  p: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
  },
  strong: {
    fontFamily: fonts.sansBold,
    color: colors.white,
  },
  em: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
  link: {
    color: BLUE_400,
    textDecorationLine: 'underline',
  },
  anchor: {
    color: BLUE_400,
  },
  list: {
    gap: 4,
    paddingLeft: 8,
  },
  listLoose: {
    gap: 8,
    paddingLeft: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
  },
  listText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
  },
  footer: {
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: tw.neutral800,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: fonts.sans,
    color: NEUTRAL_600,
  },
});
