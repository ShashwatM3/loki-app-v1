import React from 'react';
import { Text, View, Linking, StyleSheet } from 'react-native';
import { colors, fonts } from '../lib/theme';

/**
 * Minimal, dependency-free Markdown renderer for chat messages — port of
 * components/loki-markdown.tsx. Supports paragraphs, line breaks, headings,
 * unordered/ordered lists, bold, italics, inline code and links.
 */

const LINK_RE = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(...renderEmphasis(text.slice(lastIndex, match.index), `${keyPrefix}-t${i}`));
    }
    const [, label, href] = match;
    const safeHref = /^(https?:|mailto:)/i.test(href) ? href : null;
    nodes.push(
      <Text
        key={`${keyPrefix}-a${i}`}
        style={styles.link}
        onPress={safeHref ? () => Linking.openURL(safeHref) : undefined}
      >
        {label}
      </Text>
    );
    lastIndex = match.index + match[0].length;
    i += 1;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderEmphasis(text.slice(lastIndex), `${keyPrefix}-t${i}`));
  }
  return nodes;
}

function renderEmphasis(text: string, keyPrefix: string): React.ReactNode[] {
  const tokenRe = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  const parts = text.split(tokenRe).filter((p) => p !== '');
  return parts.map((part, idx) => {
    const k = `${keyPrefix}-e${idx}`;
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('__') && part.endsWith('__'))) {
      return (
        <Text key={k} style={styles.bold}>
          {part.slice(2, -2)}
        </Text>
      );
    }
    if ((part.startsWith('*') && part.endsWith('*')) || (part.startsWith('_') && part.endsWith('_'))) {
      return (
        <Text key={k} style={styles.italic}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Text key={k} style={styles.code}>
          {part.slice(1, -1)}
        </Text>
      );
    }
    return <Text key={k}>{part}</Text>;
  });
}

export function LokiMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      const headingContent = heading[2];
      blocks.push(
        <Text key={`h${key++}`} style={styles.heading}>
          {renderInline(headingContent, `h${key}`)}
        </Text>
      );
      i += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <View key={`ul${key++}`} style={styles.list}>
          {items.map((it, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.bullet}>{'\u2022'}</Text>
              <Text style={styles.itemText}>{renderInline(it, `ul${key}-${idx}`)}</Text>
            </View>
          ))}
        </View>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <View key={`ol${key++}`} style={styles.list}>
          {items.map((it, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={styles.bullet}>{idx + 1}.</Text>
              <Text style={styles.itemText}>{renderInline(it, `ol${key}-${idx}`)}</Text>
            </View>
          ))}
        </View>
      );
      continue;
    }

    const paras: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^#{1,4}\s+/.test(lines[i])
    ) {
      paras.push(lines[i]);
      i += 1;
    }
    blocks.push(
      <Text key={`p${key++}`} style={styles.paragraph}>
        {paras.map((p, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 ? '\n' : ''}
            {renderInline(p, `p${key}-${idx}`)}
          </React.Fragment>
        ))}
      </Text>
    );
  }

  return <View style={styles.container}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  paragraph: {
    marginVertical: 4,
    fontSize: 14,
    lineHeight: 22,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  heading: {
    marginVertical: 4,
    fontSize: 14,
    fontFamily: fonts.sansSemiBold,
    color: colors.foreground,
  },
  list: {
    marginVertical: 4,
    paddingLeft: 8,
    gap: 4,
  },
  listItem: {
    flexDirection: 'row',
    gap: 6,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: colors.foreground,
    fontFamily: fonts.sans,
  },
  bold: {
    fontFamily: fonts.sansBold,
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: 12,
    backgroundColor: 'rgba(3,4,5,0.6)',
    color: colors.foreground,
  },
  link: {
    fontFamily: fonts.sansMedium,
    textDecorationLine: 'underline',
    color: colors.foreground,
  },
});
