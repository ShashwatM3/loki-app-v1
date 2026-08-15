import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, tw } from '../../lib/theme';

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

function BulletLink({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.listText}>•</Text>
      <Text style={[styles.listText, { flex: 1 }]}>
        <LinkText url={url}>{children}</LinkText>
      </Text>
    </View>
  );
}

function TableRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.tableRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.tableTh}>{label}</Text>
      <Text style={styles.tableTd}>{value}</Text>
    </View>
  );
}

/** 1:1 port of app/cookie-policy/page.tsx. */
export default function CookiePolicyScreen() {
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
          <Text style={styles.h1}>Cookie Policy</Text>
          <Text style={styles.lastUpdated}>Last updated March 13, 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.p}>
            This Cookie Policy explains how Loki (&quot;Company,&quot; &quot;we,&quot;
            &quot;us,&quot; and &quot;our&quot;) uses cookies and similar technologies to recognize
            you when you visit our website at{' '}
            <LinkText url="http://lokidxb.com">http://lokidxb.com</LinkText> (&quot;Website&quot;).
            It explains what these technologies are and why we use them, as well as your rights to
            control our use of them.
          </Text>
          <Text style={styles.p}>
            In some cases we may use cookies to collect personal information, or that becomes
            personal information if we combine it with other information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>What are cookies?</Text>
          <Text style={styles.p}>
            Cookies are small data files that are placed on your computer or mobile device when you
            visit a website. Cookies are widely used by website owners in order to make their
            websites work, or to work more efficiently, as well as to provide reporting
            information.
          </Text>
          <Text style={styles.p}>
            Cookies set by the website owner (in this case, Loki) are called &quot;first-party
            cookies.&quot; Cookies set by parties other than the website owner are called
            &quot;third-party cookies.&quot; Third-party cookies enable third-party features or
            functionality to be provided on or through the website (e.g., advertising, interactive
            content, and analytics). The parties that set these third-party cookies can recognize
            your computer both when it visits the website in question and also when it visits
            certain other websites.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Why do we use cookies?</Text>
          <Text style={styles.p}>
            We use first- and third-party cookies for several reasons. Some cookies are required
            for technical reasons in order for our Website to operate, and we refer to these as
            &quot;essential&quot; or &quot;strictly necessary&quot; cookies. Other cookies also
            enable us to track and target the interests of our users to enhance the experience on
            our Online Properties. Third parties serve cookies through our Website for advertising,
            analytics, and other purposes. This is described in more detail below.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>How can I control cookies?</Text>
          <Text style={styles.p}>
            You have the right to decide whether to accept or reject cookies. You can exercise your
            cookie rights by setting your preferences in the Cookie Preference Center. The Cookie
            Preference Center allows you to select which categories of cookies you accept or
            reject. Essential cookies cannot be rejected as they are strictly necessary to provide
            you with services.
          </Text>
          <Text style={styles.p}>
            The Cookie Preference Center can be found in the notification banner and on our
            Website. If you choose to reject cookies, you may still use our Website though your
            access to some functionality and areas of our Website may be restricted. You may also
            set or amend your web browser controls to accept or refuse cookies.
          </Text>
          <Text style={styles.p}>
            The specific types of first- and third-party cookies served through our Website and the
            purposes they perform are described in the table below (please note that the specific
            cookies served may vary depending on the specific Online Properties you visit):
          </Text>

          <View style={styles.subBlock}>
            <Text style={[styles.h3, styles.underline]}>Analytics and customization cookies:</Text>
            <Text style={styles.p}>
              These cookies collect information that is used either in aggregate form to help us
              understand how our Website is being used or how effective our marketing campaigns
              are, or to help us customize our Website for you.
            </Text>

            <View style={styles.tableWrap}>
              <TableRow label="Name:" value="image" />
              <TableRow label="Provider:" value="lokidxb.com" />
              <TableRow label="Type:" value="pixel_tracker" />
              <TableRow label="Expires in:" value="session" last />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>How can I control cookies on my browser?</Text>
          <Text style={styles.p}>
            As the means by which you can refuse cookies through your web browser controls vary
            from browser to browser, you should visit your browser&apos;s help menu for more
            information. The following is information about how to manage cookies on the most
            popular browsers:
          </Text>
          <View style={styles.list}>
            <BulletLink url="https://support.google.com/chrome/answer/95647#zippy=%2Callow-or-block-cookies">
              Chrome
            </BulletLink>
            <BulletLink url="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d">
              Internet Explorer
            </BulletLink>
            <BulletLink url="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop">
              Firefox
            </BulletLink>
            <BulletLink url="https://support.apple.com/en-ie/guide/safari/sfri11471/mac">
              Safari
            </BulletLink>
            <BulletLink url="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd">
              Edge
            </BulletLink>
            <BulletLink url="https://help.opera.com/en/latest/web-preferences/">Opera</BulletLink>
          </View>
          <Text style={styles.p}>
            In addition, most advertising networks offer you a way to opt out of targeted
            advertising. If you would like to find out more information, please visit:
          </Text>
          <View style={styles.list}>
            <BulletLink url="http://www.aboutads.info/choices/">
              Digital Advertising Alliance
            </BulletLink>
            <BulletLink url="https://youradchoices.ca/">
              Digital Advertising Alliance of Canada
            </BulletLink>
            <BulletLink url="http://www.youronlinechoices.com/">
              European Interactive Digital Advertising Alliance
            </BulletLink>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>What about other tracking technologies, like web beacons?</Text>
          <Text style={styles.p}>
            Cookies are not the only way to recognize or track visitors to a website. We may use
            other, similar technologies from time to time, like web beacons (sometimes called
            &quot;tracking pixels&quot; or &quot;clear gifs&quot;). These are tiny graphics files
            that contain a unique identifier that enables us to recognize when someone has visited
            our Website or opened an email including them. This allows us, for example, to monitor
            the traffic patterns of users from one page within a website to another, to deliver or
            communicate with cookies, to understand whether you have come to the website from an
            online advertisement displayed on a third-party website, to improve site performance,
            and to measure the success of email marketing campaigns. In many instances, these
            technologies are reliant on cookies to function properly, and so declining cookies will
            impair their functioning.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Do you use Flash cookies or Local Shared Objects?</Text>
          <Text style={styles.p}>
            Websites may also use so-called &quot;Flash Cookies&quot; (also known as Local Shared
            Objects or &quot;LSOs&quot;) to, among other things, collect and store information
            about your use of our services, fraud prevention, and for other site operations.
          </Text>
          <Text style={styles.p}>
            If you do not want Flash Cookies stored on your computer, you can adjust the settings
            of your Flash player to block Flash Cookies storage using the tools contained in the{' '}
            <LinkText url="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html">
              Website Storage Settings Panel
            </LinkText>
            . You can also control Flash Cookies by going to the{' '}
            <LinkText url="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager03.html">
              Global Storage Settings Panel
            </LinkText>{' '}
            and following the instructions (which may include instructions that explain, for
            example, how to delete existing Flash Cookies (referred to &quot;information&quot; on
            the Macromedia site), how to prevent Flash LSOs from being placed on your computer
            without your being asked, and (for Flash Player 8 and later) how to block Flash Cookies
            that are not being delivered by the operator of the page you are on at the time).
          </Text>
          <Text style={styles.p}>
            Please note that setting the Flash Player to restrict or limit acceptance of Flash
            Cookies may reduce or impede the functionality of some Flash applications, including,
            potentially, Flash applications used in connection with our services or online content.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Do you serve targeted advertising?</Text>
          <Text style={styles.p}>
            Third parties may serve cookies on your computer or mobile device to serve advertising
            through our Website. These companies may use information about your visits to this and
            other websites in order to provide relevant advertisements about goods and services
            that you may be interested in. They may also employ technology that is used to measure
            the effectiveness of advertisements. They can accomplish this by using cookies or web
            beacons to collect information about your visits to this and other sites in order to
            provide relevant advertisements about goods and services of potential interest to you.
            The information collected through this process does not enable us or them to identify
            your name, contact details, or other details that directly identify you unless you
            choose to provide these.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>How often will you update this Cookie Policy?</Text>
          <Text style={styles.p}>
            We may update this Cookie Policy from time to time in order to reflect, for example,
            changes to the cookies we use or for other operational, legal, or regulatory reasons.
            Please therefore revisit this Cookie Policy regularly to stay informed about our use of
            cookies and related technologies.
          </Text>
          <Text style={styles.p}>
            The date at the top of this Cookie Policy indicates when it was last updated.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.h2}>Where can I get further information?</Text>
          <Text style={styles.p}>
            If you have any questions about our use of cookies or other technologies, please
            contact us at:
          </Text>
          <Text style={[styles.p, { color: tw.neutral400 }]}>
            Loki{'\n'}
            <LinkText url="mailto:contact@lokidxb.com">contact@lokidxb.com</LinkText>
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This Cookie Policy was created using Termly&apos;s{' '}
            <LinkText url="https://termly.io/products/cookie-consent-manager/">
              Cookie Consent Manager
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
  underline: {
    textDecorationLine: 'underline',
  },
  p: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: fonts.sans,
    color: colors.mutedForeground,
  },
  link: {
    color: BLUE_400,
    textDecorationLine: 'underline',
  },
  list: {
    gap: 4,
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
  tableWrap: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: tw.neutral800,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: tw.neutral800,
  },
  tableTh: {
    width: 112,
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.sans,
    color: tw.neutral400,
  },
  tableTd: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.sans,
    color: tw.neutral500,
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
