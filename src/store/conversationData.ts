export interface Message {
    id: number;
    text: string;
    sender: 'agent' | 'user';
    content: '' | 'action_id' | 'gene';
}

const summary = `Here is a summary of the current data:
- Donor Info: Male, 62
- Tissue Source: Lung
- Disease Status: NSCLC
- Treatment: Anti-PD-1 Immunotherapy, 4 weeks
- Processing: 10x Genomics Chromium v3.1
- Sample Time: 2024/5/10`;

export const initialMessages: Message[] = [{id: 1, text: summary, sender: 'agent', content: ''}];
