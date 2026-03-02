/**
 * MetaInfo 组件相关类型定义
 */

/** MetaInfo 项目类型 */
export interface MetaInfoItem {
    /** 显示标签 */
    label: string;
    /** 值内容 */
    value: string;
    /** 类型：select 选择框 或 text 文本 */
    type: 'select' | 'text';
    /** 图标名称（用于 SVG 图标） */
    icon?: string;
    /** 选择框选项（仅当 type 为 'select' 时使用） */
    options?: string[];
}

/** 上表数据项类型 */
export interface TopTableItem {
    label: string;
    value: string;
    options?: string[];
}

/** 下表数据项类型 */
export interface BottomTableItem {
    label: string;
    value: string;
    icon: string;
}