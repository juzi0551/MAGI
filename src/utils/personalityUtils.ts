/**
 * 人格配置工具函数
 * 提供统一的人格信息获取接口
 */

import { PersonalitySettings, PersonalityConfig, UserConfig } from '../types/config';
import { PersonalityId } from '../types/ai';
import { HistoryRecord } from '../types/history';
import { DEFAULT_PERSONALITIES, DEFAULT_PERSONALITY_PROMPTS } from '../config/prompts';

/**
 * 获取人格的显示名称
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns 格式化的显示名称
 */
export function getPersonalityDisplayName(
  personalityId: PersonalityId, 
  config?: PersonalitySettings
): string {
  if (!config || !config[personalityId]) {
    const defaultPersonality = DEFAULT_PERSONALITIES[personalityId];
    return `${defaultPersonality.displayName} (${defaultPersonality.subtitle})`;
  }
  
  const personality = config[personalityId];
  return `${personality.displayName} (${personality.subtitle})`;
}

/**
 * 获取人格的完整名称（用于标题等显示）
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns 完整名称
 */
export function getPersonalityFullName(
  personalityId: PersonalityId,
  config?: PersonalitySettings  
): string {
  const personality = config?.[personalityId] || DEFAULT_PERSONALITIES[personalityId];
  return `${personality.displayName} (${personality.subtitle})`;
}

/**
 * 获取人格的简短名称（仅显示名称）
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns 简短名称
 */
export function getPersonalityShortName(
  personalityId: PersonalityId,
  config?: PersonalitySettings
): string {
  const personality = config?.[personalityId] || DEFAULT_PERSONALITIES[personalityId];
  return personality.displayName;
}

/**
 * 获取人格的提示词
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns 提示词内容
 */
export function getPersonalityPrompt(
  personalityId: PersonalityId,
  config?: PersonalitySettings
): string {
  const personality = config?.[personalityId];
  
  // 如果有自定义提示词且不为空，使用自定义的
  if (personality?.customPrompt && personality.customPrompt.trim()) {
    return personality.customPrompt;
  }
  
  // 否则使用默认提示词
  return DEFAULT_PERSONALITY_PROMPTS[personalityId] || '';
}

/**
 * 获取人格配置，如果不存在则返回默认配置
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns 人格配置对象
 */
export function getPersonalityConfig(
  personalityId: PersonalityId,
  config?: PersonalitySettings
): PersonalityConfig {
  return config?.[personalityId] || DEFAULT_PERSONALITIES[personalityId];
}

/**
 * 验证人格配置的完整性
 * @param config 人格配置
 * @returns 是否有效
 */
export function validatePersonalitySettings(config: PersonalitySettings): boolean {
  const requiredIds: PersonalityId[] = ['melchior', 'balthasar', 'casper'];
  
  for (const id of requiredIds) {
    const personality = config[id];
    if (!personality || 
        !personality.id || 
        !personality.displayName || 
        !personality.subtitle) {
      return false;
    }
  }
  
  return true;
}

/**
 * 创建默认人格配置的深拷贝
 * @returns 默认人格配置的副本
 */
export function createDefaultPersonalities(): PersonalitySettings {
  return JSON.parse(JSON.stringify(DEFAULT_PERSONALITIES));
}

/**
 * 合并用户配置和默认配置
 * @param userConfig 用户配置
 * @returns 合并后的配置
 */
export function mergePersonalitySettings(
  userConfig?: Partial<PersonalitySettings>
): PersonalitySettings {
  const defaultConfig = createDefaultPersonalities();
  
  if (!userConfig) {
    return defaultConfig;
  }
  
  return {
    melchior: { ...defaultConfig.melchior, ...userConfig.melchior },
    balthasar: { ...defaultConfig.balthasar, ...userConfig.balthasar },
    casper: { ...defaultConfig.casper, ...userConfig.casper }
  };
}

/**
 * 从旧格式配置迁移到新格式
 * @param oldConfig 旧的用户配置
 * @returns 迁移后的人格配置
 */
export function migratePersonalityConfig(oldConfig: UserConfig): PersonalitySettings {
  const defaultPersonalities = createDefaultPersonalities();
  
  // 如果存在新格式，直接使用（合并默认值）
  if (oldConfig.personalities) {
    return mergePersonalitySettings(oldConfig.personalities);
  }
  
  // 从旧格式迁移
  if (oldConfig.customPrompts) {
    return {
      melchior: {
        ...defaultPersonalities.melchior,
        customPrompt: oldConfig.customPrompts.melchior || ''
      },
      balthasar: {
        ...defaultPersonalities.balthasar,
        customPrompt: oldConfig.customPrompts.balthasar || ''
      },
      casper: {
        ...defaultPersonalities.casper,
        customPrompt: oldConfig.customPrompts.casper || ''
      }
    };
  }
  
  return defaultPersonalities;
}

/**
 * 获取MAGI面板显示的人格名称（特殊逻辑）
 * 保持原始效果：如果没有自定义名称，使用原始短名称；如果有自定义名称，使用自定义名称
 * @param personalityId 人格ID
 * @param config 人格配置（可选）
 * @returns MAGI面板专用的显示名称
 */
export function getMagiPanelDisplayName(
  personalityId: PersonalityId,
  config?: PersonalitySettings
): string {
  const personality = config?.[personalityId];
  
  // 如果没有配置或使用默认名称，返回原始短名称格式（保持原始效果）
  if (!personality || 
      !personality.displayName || 
      personality.displayName === DEFAULT_PERSONALITIES[personalityId].displayName) {
    switch (personalityId) {
      case 'melchior': return 'MELCHIOR';
      case 'balthasar': return 'BALTHASAR';
      case 'casper': return 'CASPER';
      default: return (personalityId as string).toUpperCase();
    }
  }
  
  // 如果有自定义名称，使用自定义的显示名称（不含副标题）
  return personality.displayName;
}

/**
 * 检查是否需要迁移配置
 * @param config 用户配置
 * @returns 是否需要迁移
 */
export function needsMigration(config: UserConfig): boolean {
  // 如果没有新格式但有旧格式，需要迁移
  return !config.personalities && !!config.customPrompts;
}

/**
 * 创建历史记录时的人格名称快照
 * @param personalities 人格配置（可选）
 * @returns 人格名称快照
 */
export function createPersonalitySnapshot(
  personalities?: PersonalitySettings
): HistoryRecord['personalityNamesSnapshot'] {
  return {
    melchior: getPersonalityFullName('melchior', personalities),
    balthasar: getPersonalityFullName('balthasar', personalities),
    casper: getPersonalityFullName('casper', personalities)
  };
}

/**
 * 从历史记录获取人格名称（优先使用缓存的名称）
 * @param personalityId 人格ID
 * @param record 历史记录
 * @param currentConfig 当前配置（用于兼容旧记录）
 * @returns 历史记录中的人格名称
 */
export function getHistoryPersonalityName(
  personalityId: PersonalityId,
  record: HistoryRecord,
  currentConfig?: PersonalitySettings
): string {
  // 优先使用历史快照中的名称
  if (record.personalityNamesSnapshot) {
    return record.personalityNamesSnapshot[personalityId];
  }
  
  // 回退到当前配置（用于兼容旧记录）
  return getPersonalityFullName(personalityId, currentConfig);
}

/**
 * 迁移历史记录（为旧记录添加名称快照）
 * @param record 历史记录
 * @param currentPersonalities 当前人格配置
 * @returns 迁移后的历史记录
 */
export function migrateHistoryRecord(
  record: HistoryRecord,
  currentPersonalities?: PersonalitySettings
): HistoryRecord {
  // 如果已经有快照，直接返回
  if (record.personalityNamesSnapshot) {
    return record;
  }
  
  // 为旧记录创建快照（使用当前配置作为最佳猜测）
  return {
    ...record,
    personalityNamesSnapshot: createPersonalitySnapshot(currentPersonalities)
  };
}