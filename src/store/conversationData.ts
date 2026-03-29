export interface Message {
    id: number;
    text: string;
    sender: 'agent' | 'user';
    content: 'D' | 'A1' | 'G';
}

const summary = `Here is a summary of the current data:
- Donor Info: Hispanic or Latino origin
- Tissue Source: Homo sapiens
- Disease Status: MONDO:0005132
- Treatment: Unknown
- Processing: Unknown
- Sample Time: Immune Variation Day 0
- Cells x Genes: 9354 x 18063 
- Disease: cytomegalovirus infection
- Sex: female
- Subject Cmv: Positive
- Title: Other cell types`;

const action_comment = `The UMAP plots show clear separation between different cell clusters, with significant differences between them, indicating that clustering is effective to some extent. However, based on the UMAP results, the expression of marker genes in some clusters may still require further verification.
Cluster 0: Annotated as B cells, based on marker genes such as IGHM, KCNK17, and CD74. IGHM is a typical marker gene for B cells, indicating that this cluster is correctly annotated.
Cluster 1: Annotated as T cells, based on marker genes such as MYB and EEF2. MYB is a key transcription factor in T cell development, and together with SPN, it supports T cell annotation, making the annotation reasonable.
Cluster 2: Annotated as thymocytes. PTCRA is a thymocyte-specific marker, and the selection of marker genes for this annotation is also well supported.
Cluster 3: Annotated as megakaryocytes. Marker genes such as ITGA2B and ITGB3 are typical megakaryocyte markers, and the annotation is consistent with biological knowledge.
Cluster 4: Annotated as megakaryocytes. Marker genes such as ITGA2B and THBS1 are standard markers for megakaryocytes, and the annotation is effective.
Cluster 5: Annotated as monocytes. Marker genes LYZ and S100A9 support this annotation. The annotation has moderate accuracy and backtracking.
Cluster 6: Annotated as erythrocyte precursors. Marker genes such as HBB and ALAS2 support this annotation, and the annotation is very confident.
Cluster 7: Annotated as endothelial cells. High expression of PECAM1 and TYMS supports this annotation, and the overall result is good.
Cluster 8: Annotated as neutrophils. High expression of MPO and CSF3R confirms this annotation, and the accuracy is high.
Cluster 9: Annotated as mast cells. The expression of marker genes such as HDC and LMO4 is highly specific, and the annotation is accurate.
Next Steps:Based on the current annotation results, the following steps can be considered for the next steps:Optimize cluster quality: Try adjusting the resolution and observe the clustering effect at different resolutions. The current resolution (0.5) is an initial attempt and may be too broad. Increasing the resolution appropriately may help with more refined classification.`;

const gene_reply = `IGHN is a gene that encodes the IgH chain, which is a protein that is involved in the immune response. CD74 is a gene that encodes the CD74 protein, which is a protein that is involved in the immune response.
CD74 antigen (invariant polypeptide of major histocompatibility complex, class II antigen-associated) [Mus musculus (house mouse)]
Location in Chromosome 18, NC_000084.7 (60936921..60945724)`;

export const initialMessages: Message[] = [
    {id: 1, text: 'Please summarize the information in this dataset for me.', sender: 'user', content: 'D'},
    {id: 2, text: summary, sender: 'agent', content: ''},
    {
        id: 3,
        text: 'What did "action 1" do? is the annotation result of this action reasonable?',
        sender: 'user',
        content: 'A1'
    },
    {id: 4, text: action_comment, sender: 'agent', content: ''},
    {
        id: 5,
        text: 'What are the functions of the genes IGHN and CD74?',
        sender: 'user',
        content: 'G'
    },
    {
        id: 6,
        text: gene_reply,
        sender: 'agent',
        content: 'action_id'
    }
];
