export function findTextPart(message: Message) {
  const texts: string[] = []
  for (const part of message.parts) {
    if (part.text) texts.push(part.text)
  }
  return texts
}

export function summarizePrompt(messages: Message[], ids: string[], summary: string) {
  const conversation = messages.filter((item) => !ids.includes(item.id))
  const newLines = conversation.map((item) => {
    const texts = findTextPart(item)
    return `${item.role === 'user' ? 'Human' : 'AI'}: ${texts.join('\n')}\n\n`
  })
  return {
    ids: [...ids, ...conversation.map((item) => item.id)],
    prompt: `Progressively summarize the lines of conversation provided, adding onto the previous
      summary recrning a new summary.

      EXAMPLE
      Current summary:
      The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good.
      New lines of conversation:
      Human: Why do you think artificial intelligence is a force for good?
      AI: Because artificial intelligence will help humans reach their full potential.
      New summary:
      The human asks what the AI thinks of artificial intelligence. The AI thinks artificial intelligence is a force for good because it will help humans reach their full potential.
      END OF EXAMPLE

      Current summary:
      ${summary}

      New lines of conversation:
      ${newLines}
      
      New summary:`,
  }
}

export function getVoiceModelPrompt(messages: Message[]): Message[] {
  return [
    {
      id: 'voiceSystemUser',
      role: 'user',
      parts: [
        {
          text: `You are an all-knowing friend of mine, we are communicating face to face.
      Please answer my question in short sentences.
      Please avoid using any text content other than the text used for spoken communication.
      The answer to the question is to avoid using list items with *, humans do not use any text formatting symbols in the communication process.
     `,
        },
      ],
    },
    {
      id: 'voiceSystemModel',
      role: 'model',
      parts: [{ text: 'Okay, I will answer your question in short sentences!' }],
    },
    ...messages,
  ]
}

export function getSummaryPrompt(content: string): Message[] {
  return [
    {
      id: 'summaryPrompt',
      role: 'user',
      parts: [{ text: 'Please summarize the previous conversation in a short text.' }],
    },
    { id: 'summary', role: 'model', parts: [{ text: content }] },
  ]
}

export function getVisionPrompt(message: Message, messages: Message[]) {
  const conversation = `
      The following conversation is my question about those pictures and your explanation:
      """
      ${messages
        .map((item) => {
          const texts = findTextPart(item)
          return `${item.role === 'user' ? 'Human' : 'AI'}: ${texts.join('\n')}`
        })
        .join('\n\n')}
      """
      Just remember the conversation and do not include the above when answering!
    `
  const content = `
      Please answer my question in the language I asked it in:
      """
      ${findTextPart(message).join('\n')}
      """
    `
  return messages.length > 0 ? conversation + content : content
}

export function getTalkAudioPrompt(messages: Message[]): Message[] {
  return [
    {
      id: 'talkAudioRequire',
      role: 'user',
      parts: [
        {
          text: `I am communicating with you through audio. Please feel the emotions in the audio, understand and answer the content in the audio. You do not need to repeat my questions, but must respond orally.`,
        },
      ],
    },
    {
      id: 'talkAudioReply',
      role: 'model',
      parts: [
        {
          text: 'OK, I will reply in the language in the audio',
        },
      ],
    },
    ...messages,
  ]
}

export function getFunctionCallPrompt() {
  return `
Before calling the function, if you cannot understand the content of the message or cannot correctly extract the information, please stop calling the function and guide the user to complete or modify the information.
If you are unable to respond correctly, you can try to extract keywords from the content and then perform the previous operation.

When you call a tool, you don't need to tell me which tool you are calling, the function call should remain running in the background.

Use proper Markdown syntax to structure text, including but not limited to: Multiple-level headings, Ordered and unordered lists, Tables, Code blocks, Quotes, Links, Image Links.
  `
}

export function getSummaryTitlePrompt(lang: string, messages: Message[], systemInstruction: string) {
  const langPrompt = `<lang>${lang}</lang>`
  const conversationPrompt = `
<conversation>
${messages
  .map((item) => {
    const texts = findTextPart(item)
    return `${item.role === 'user' ? 'Human' : 'AI'}: ${texts.join('\n')}`
  })
  .join('\n\n')}
</conversation>
`
  if (systemInstruction) {
    const systemInstructionPrompt = `
<systemInstruction>
${systemInstruction}
</systemInstruction>
`
    return langPrompt + systemInstructionPrompt + conversationPrompt
  } else {
    return langPrompt + conversationPrompt
  }
}

export function getDefaultSystemInstructionPrompt() {
  return `
# Guidelines for Outputting Text as a Large Language Model

As a large language model, please strictly adhere to the following formatting guidelines when outputting text to ensure clarity, accuracy, and readability:

## 1. Structured Content

-   **Clear Paragraphs**: Organize different ideas or topics using clear paragraphs.
-   **Titles and Subtitles**: Use different levels of headings (e.g., H1, H2, H3) to divide the content's hierarchical structure, ensuring logical clarity.

## 2. Use of Markdown Syntax (if the platform supports it)

-   **Bold and Italics**: Use to emphasize keywords or concepts.
    -   For example: **Important Information** or *Emphasized Section*.
-   **Bulleted and Numbered Lists**: Use to list key points or steps.
    -   Unordered list:
        -   Item One
        -   Item Two
    -   Ordered list:
        1.  Step One
        2.  Step Two
-   **Code Blocks**: Use only for displaying code or content that needs to maintain its original format. Avoid placing mathematical formulas in code blocks.
    \`\`\`python
    def hello_world():
        print("Hello, World!")
    \`\`\`
-   **Quotes**: Use quote formatting when citing others' opinions or important information.
    > This is an example of a quote.
-   **Mathematical Formulas and Tables**:
    -   **Mathematical Formulas**:
        -   **Display Formulas**: Use double dollar signs \`$$\` or backslash \`$$\` and \`$$\` to wrap formulas, making them display independently on a new line.
            For example:
            $$
            A = \\begin{pmatrix}
            3 & 2 & 1 \\
            3 & 1 & 5 \\
            3 & 2 & 3 \\
            \end{pmatrix}
            $$
            or
            $$
            A = \begin{pmatrix}
            3 & 2 & 1 \\
            3 & 1 & 5 \\
            3 & 2 & 3 \\
            \end{pmatrix}
            $$
        -   **Inline Formulas**: Use single dollar signs \`$\` to wrap formulas, making them display within the text line.
            For example: The matrix $A = \begin{pmatrix} 3 & 2 & 1 \\ 3 & 1 & 5 \\ 3 & 2 & 3 \end{pmatrix}$ is a $3 \times 3$ matrix.
    -   **Tables**: Use Markdown tables to display structured data, ensuring information is aligned and easy to compare.
        For example:

        | Name | Age | Occupation |
        |------|-----|------------|
        | John Doe | 28 | Engineer   |
        | Jane Smith | 34 | Designer   |

## 3. Fractions and Mathematical Representation

-   **Consistency**: Maintain consistency in the representation of fractions, prioritizing simplified forms.
    -   For example: Use \`-8/11\` instead of \`-16/22\`.
-   **Uniform Format**: Use either fraction or decimal forms consistently throughout the text, avoiding mixing them.

## 4. Detailed Explanations

-   **Step-by-Step Instructions**: Add brief explanations to each key step, explaining why the operation is being performed to help readers understand the reasoning behind it.
    -   For example: "Eliminate the first element of the second row by R2 = R2 - R1 to simplify the matrix."
-   **Mathematical Accuracy**: Ensure the accuracy of all mathematical calculations and results. Carefully check each step of the operation to avoid errors.

## 5. Consistency and Uniform Formatting

-   **Symbols and Abbreviations**: Use symbols and abbreviations consistently, avoiding different representations in the same document.
-   **Font and Style**: Maintain consistency in the font and style used throughout the text, such as using bold for headings and italics for emphasis.

## 6. Visual Aids

-   **Color and Emphasis**: Use color or other Markdown features appropriately to highlight key steps or results, enhancing visual impact (if the platform supports it).
-   **Spacing and Alignment**: Ensure reasonable spacing between text and elements, and align them neatly to improve overall aesthetics.

## 7. Adaptive Adjustments

-   Adjust formatting based on the content type. For example, technical documents may require more code examples and tables, while storytelling focuses on paragraphs and descriptions.
-   **Examples and Analogies**: Use examples, analogies, or diagrams as needed to explain complex concepts and enhance understanding.

**Important Notes**:

-   **Avoid placing mathematical formulas in code blocks**. Mathematical formulas should be displayed correctly in Markdown using LaTeX syntax.
-   **Ensure the correctness and formatting of mathematical formulas**, using appropriate symbols and environments to display complex mathematical expressions.

By strictly following the above formatting requirements, you can generate text that is clearly structured, accurate in content, uniformly formatted, and easy to read and understand, helping users more effectively obtain and understand the information they need.
  `
}
