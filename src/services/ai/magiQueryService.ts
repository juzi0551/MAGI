import { AIService } from './aiService';
import { MagiQuestion, MagiDecision, WiseManAnswer } from '../../types/ai';
import { 
  YES_NO_QUESTION_PROMPT, 
  PERSONALITY_PROMPTS
} from '../../config/prompts';

/**
 * MAGI查询服务 - 核心业务逻辑
 * 处理三贤者并行查询和最终决策计算
 */
export class MagiQueryService {
  
  /**
   * 处理MAGI问题查询的完整流程
   * @param question 用户问题
   * @returns MAGI决策结果
   */
  static async processQuestion(question: MagiQuestion): Promise<MagiDecision> {
    try {
      console.log('开始处理MAGI问题:', question);

      // 步骤1: 判断问题类型（是非题 vs 开放题）
      const isYesNo = await AIService.isYesNoQuestion(question, YES_NO_QUESTION_PROMPT);
      console.log('问题类型判断结果:', isYesNo ? '是非题' : '开放题');

      // 步骤2: 获取三贤者人格提示词
      const personalities = [
        PERSONALITY_PROMPTS.melchior,
        PERSONALITY_PROMPTS.balthasar,
        PERSONALITY_PROMPTS.casper
      ];

      // 步骤3: 并行查询三贤者
      console.log('开始并行查询三贤者...');
      const rawResponses = await AIService.fetchMagiAnswers(question, personalities, isYesNo);
      
      // 步骤4: 解析贤者回答
      const wiseManAnswers: WiseManAnswer[] = rawResponses.map((response, index) => {
        const wiseManNames = ['Melchior-1', 'Balthasar-2', 'Casper-3'];
        const wiseManTypes = ['scientist', 'mother', 'woman'];
        
        return {
          id: `${question.id}-${wiseManNames[index].toLowerCase()}`,
          name: wiseManNames[index],
          type: wiseManTypes[index] as 'scientist' | 'mother' | 'woman',
          response: response.response,
          status: response.status as 'yes' | 'no' | 'conditional' | 'info' | 'error',
          conditions: response.conditions || [],
          error: response.error || null,
          timestamp: new Date()
        };
      });

      // 步骤5: 计算最终决策
      const finalDecision = this.calculateFinalDecision(wiseManAnswers, isYesNo);
      
      const result: MagiDecision = {
        id: question.id,
        question: question.query,
        questionType: isYesNo ? 'yes-no' : 'open',
        wiseManAnswers,
        finalDecision,
        timestamp: new Date(),
        processingTime: Date.now() - question.timestamp.getTime()
      };

      console.log('MAGI决策完成:', result);
      return result;

    } catch (error) {
      console.error('MAGI问题处理失败:', error);
      
      // 返回错误状态的决策
      return {
        id: question.id,
        question: question.query,
        questionType: 'open',
        wiseManAnswers: [],
        finalDecision: {
          result: 'error',
          confidence: 0,
          reasoning: error instanceof Error ? error.message : '未知错误',
          consensusLevel: 'none'
        },
        timestamp: new Date(),
        processingTime: Date.now() - question.timestamp.getTime()
      };
    }
  }

  /**
   * 计算最终决策
   * @param answers 三贤者的回答
   * @param isYesNo 是否为是非题
   * @returns 最终决策
   */
  private static calculateFinalDecision(
    answers: WiseManAnswer[], 
    isYesNo: boolean
  ): MagiDecision['finalDecision'] {
    
    if (!isYesNo) {
      // 开放题：综合所有信息，不做最终决策
      return {
        result: 'info',
        confidence: 1.0,
        reasoning: '开放性问题，已收集所有贤者的分析意见。',
        consensusLevel: 'informational'
      };
    }

    // 是非题：进行决策计算
    const validAnswers = answers.filter(answer => 
      answer.status !== 'error' && answer.response
    );

    if (validAnswers.length === 0) {
      return {
        result: 'error',
        confidence: 0,
        reasoning: '所有贤者都无法提供有效回答。',
        consensusLevel: 'none'
      };
    }

    // 统计各状态的投票
    const statusCount = {
      yes: 0,
      no: 0,
      conditional: 0,
      error: 0
    };

    validAnswers.forEach(answer => {
      if (answer.status === 'yes') statusCount.yes++;
      else if (answer.status === 'no') statusCount.no++;
      else if (answer.status === 'conditional') statusCount.conditional++;
      else statusCount.error++;
    });

    console.log('贤者投票统计:', statusCount);

    // 决策逻辑
    const totalValid = statusCount.yes + statusCount.no + statusCount.conditional;
    
    if (totalValid === 0) {
      return {
        result: 'error',
        confidence: 0,
        reasoning: '没有贤者提供有效的决策状态。',
        consensusLevel: 'none'
      };
    }

    // 计算最终结果和共识级别
    let result: 'yes' | 'no' | 'conditional' | 'error';
    let consensusLevel: 'unanimous' | 'majority' | 'split' | 'none';
    let confidence: number;
    let reasoning: string;

    if (statusCount.yes > statusCount.no && statusCount.yes > statusCount.conditional) {
      // YES占多数
      result = 'yes';
      if (statusCount.yes === totalValid) {
        consensusLevel = 'unanimous';
        confidence = 1.0;
        reasoning = '三贤者一致同意。';
      } else if (statusCount.yes >= Math.ceil(totalValid / 2)) {
        consensusLevel = 'majority';
        confidence = statusCount.yes / totalValid;
        reasoning = `${statusCount.yes}/${totalValid} 贤者同意。`;
      } else {
        consensusLevel = 'split';
        confidence = 0.5;
        reasoning = '贤者意见分歧，倾向同意。';
      }
    } else if (statusCount.no > statusCount.yes && statusCount.no > statusCount.conditional) {
      // NO占多数
      result = 'no';
      if (statusCount.no === totalValid) {
        consensusLevel = 'unanimous';
        confidence = 1.0;
        reasoning = '三贤者一致拒绝。';
      } else if (statusCount.no >= Math.ceil(totalValid / 2)) {
        consensusLevel = 'majority';
        confidence = statusCount.no / totalValid;
        reasoning = `${statusCount.no}/${totalValid} 贤者拒绝。`;
      } else {
        consensusLevel = 'split';
        confidence = 0.5;
        reasoning = '贤者意见分歧，倾向拒绝。';
      }
    } else if (statusCount.conditional > statusCount.yes && statusCount.conditional > statusCount.no) {
      // CONDITIONAL占多数
      result = 'conditional';
      consensusLevel = statusCount.conditional === totalValid ? 'unanimous' : 'majority';
      confidence = statusCount.conditional / totalValid;
      reasoning = `${statusCount.conditional}/${totalValid} 贤者认为需要满足条件。`;
    } else {
      // 平局或复杂情况
      result = 'conditional';
      consensusLevel = 'split';
      confidence = 0.3;
      reasoning = '贤者意见高度分歧，建议谨慎考虑。';
    }

    return {
      result,
      confidence,
      reasoning,
      consensusLevel
    };
  }

  /**
   * 获取决策状态的可视化信息
   */
  static getDecisionVisualization(decision: MagiDecision) {
    const { finalDecision, questionType } = decision;
    
    if (questionType === 'open') {
      return {
        color: '#666666', // 灰色，表示信息性
        icon: 'info',
        label: '信息收集',
        description: '开放性问题，已收集各贤者分析'
      };
    }

    switch (finalDecision.result) {
      case 'yes':
        return {
          color: finalDecision.consensusLevel === 'unanimous' ? '#00ff00' : '#90EE90', // 绿色
          icon: 'check',
          label: '同意',
          description: finalDecision.reasoning
        };
      case 'no':
        return {
          color: finalDecision.consensusLevel === 'unanimous' ? '#ff0000' : '#FFB6C1', // 红色
          icon: 'close',
          label: '拒绝',
          description: finalDecision.reasoning
        };
      case 'conditional':
        return {
          color: '#ff8d00', // 橙色
          icon: 'warning',
          label: '有条件',
          description: finalDecision.reasoning
        };
      case 'error':
      default:
        return {
          color: '#808080', // 灰色
          icon: 'error',
          label: '错误',
          description: finalDecision.reasoning
        };
    }
  }
}

export default MagiQueryService;