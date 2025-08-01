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
      console.log('🚀 开始MAGI决策流程');
      console.log('❓ 问题详情:', {
        id: question.id,
        query: question.query,
        timestamp: question.timestamp.toISOString()
      });

      // 步骤1: 判断问题类型（是非题 vs 开放题）
      console.log('📋 步骤1: 判断问题类型');
      const startTimeTotal = Date.now();
      const isYesNo = await AIService.isYesNoQuestion(question, YES_NO_QUESTION_PROMPT);
      console.log(`✅ 问题类型判断完成: ${isYesNo ? '是非题' : '开放题'}`);

      // 步骤2: 获取三贤者人格提示词
      console.log('📋 步骤2: 准备三贤者人格');
      const personalities = [
        PERSONALITY_PROMPTS.melchior,
        PERSONALITY_PROMPTS.balthasar,
        PERSONALITY_PROMPTS.casper
      ];
      console.log('✅ 三贤者人格准备完成:', {
        melchiorLength: personalities[0].length,
        balthasarLength: personalities[1].length,
        casperLength: personalities[2].length
      });

      // 步骤3: 并行查询三贤者
      console.log('📋 步骤3: 并行查询三贤者');
      const rawResponses = await AIService.fetchMagiAnswers(question, personalities, isYesNo);
      console.log('✅ 三贤者查询完成，开始解析回答');
      
      // 步骤4: 解析贤者回答
      console.log('📋 步骤4: 解析贤者回答');
      const wiseManAnswers: WiseManAnswer[] = rawResponses.map((response, index) => {
        const wiseManNames = ['Melchior-1', 'Balthasar-2', 'Casper-3'];
        const wiseManTypes = ['scientist', 'mother', 'woman'];
        
        const answer: WiseManAnswer = {
          id: `${question.id}-${wiseManNames[index].toLowerCase()}`,
          name: wiseManNames[index],
          type: wiseManTypes[index] as 'scientist' | 'mother' | 'woman',
          response: response.response,
          status: response.status as 'yes' | 'no' | 'conditional' | 'info' | 'error',
          conditions: response.conditions || [],
          error: response.error || null,
          timestamp: new Date()
        };

        console.log(`🎯 ${wiseManNames[index]} 回答解析:`, {
          status: answer.status,
          responseLength: answer.response.length,
          hasConditions: (answer.conditions || []).length > 0,
          hasError: !!answer.error
        });

        return answer;
      });

      // 步骤5: 计算最终决策
      console.log('📋 步骤5: 计算最终决策');
      const finalDecision = this.calculateFinalDecision(wiseManAnswers, isYesNo);
      console.log('✅ 最终决策计算完成:', {
        result: finalDecision.result,
        confidence: finalDecision.confidence,
        consensusLevel: finalDecision.consensusLevel
      });
      
      const endTimeTotal = Date.now();
      const totalProcessingTime = endTimeTotal - startTimeTotal;

      const result: MagiDecision = {
        id: question.id,
        question: question.query,
        questionType: isYesNo ? 'yes-no' : 'open',
        wiseManAnswers,
        finalDecision,
        timestamp: new Date(),
        processingTime: totalProcessingTime
      };

      console.log('🎉 MAGI決策流程全部完成');
      console.log('📊 処理統計:', {
        总耗时: `${totalProcessingTime}ms`,
        问题类型: result.questionType,
        贤者回答数: result.wiseManAnswers.length,
        最终决策: result.finalDecision.result,
        置信度: `${Math.round(result.finalDecision.confidence * 100)}%`
      });

      return result;

    } catch (error) {
      console.error('💥 MAGI决策流程失败:', error);
      
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
    
    console.log('🔄 开始计算最终决策');
    console.log('📊 贤者回答概览:', answers.map(a => ({
      name: a.name,
      status: a.status,
      hasConditions: (a.conditions || []).length > 0,
      hasError: !!a.error
    })));

    if (!isYesNo) {
      // 开放题：综合所有信息，不做最终决策
      console.log('ℹ️ 开放题处理: 不进行决策，提供综合信息');
      return {
        result: 'info',
        confidence: 1.0,
        reasoning: '开放性问题，已收集所有贤者的分析意见。',
        consensusLevel: 'informational'
      };
    }

    // 是非题：按照原项目的多数决逻辑
    console.log('⚖️ 是非题处理: 使用原项目多数决逻辑');
    
    // 🚫 Casper的一票否决权：只对"no"状态生效
    const casperAnswer = answers.find(a => 
      a.name.toLowerCase().includes('casper') || a.type === 'woman'
    );
    
    if (casperAnswer && casperAnswer.status === 'no') {
      console.log('🚫 Casper行使一票否决权');
      return {
        result: 'no',
        confidence: 1.0,
        reasoning: 'Casper行使一票否决权。',
        consensusLevel: 'unanimous'
      };
    }

    // 错误优先处理
    const hasError = answers.some(a => a.status === 'error');
    if (hasError) {
      console.log('❌ 检测到错误状态，优先处理');
      return {
        result: 'error',
        confidence: 0,
        reasoning: '有贤者处理出现错误。',
        consensusLevel: 'none'
      };
    }

    // 统计各状态票数
    const statusCount = {
      yes: 0,
      no: 0,
      conditional: 0,
      info: 0
    };

    answers.forEach(answer => {
      if (answer.status === 'yes') statusCount.yes++;
      else if (answer.status === 'no') statusCount.no++;
      else if (answer.status === 'conditional') statusCount.conditional++;
      else if (answer.status === 'info') statusCount.info++;
    });

    console.log('🗳️ 贤者投票统计:', statusCount);

    // 找到得票最多的状态
    const maxCount = Math.max(...Object.values(statusCount));
    
    // 如果有状态获得2票或以上，采用该状态
    if (maxCount >= 2) {
      for (const [status, count] of Object.entries(statusCount)) {
        if (count === maxCount) {
          console.log(`✅ 多数决通过: ${status} (${count}票)`);
          
          let confidence = count / answers.length;
          let consensusLevel: 'unanimous' | 'majority' = count === answers.length ? 'unanimous' : 'majority';
          let reasoning = count === answers.length 
            ? `三贤者一致${status === 'yes' ? '同意' : status === 'no' ? '拒绝' : '认为需要条件'}。`
            : `${count}/${answers.length} 贤者${status === 'yes' ? '同意' : status === 'no' ? '拒绝' : '认为需要条件'}。`;

          return {
            result: status as 'yes' | 'no' | 'conditional' | 'info',
            confidence,
            reasoning,
            consensusLevel
          };
        }
      }
    }

    // 1:1:1的情况，按优先级处理
    console.log('⚖️ 三方各异，按优先级处理');
    
    if (statusCount.conditional > 0) {
      console.log('⚠️ 优先选择条件决策');
      return {
        result: 'conditional',
        confidence: 0.5,
        reasoning: '贤者意见分歧，按优先级选择条件决策。',
        consensusLevel: 'split'
      };
    } else if (statusCount.yes > 0) {
      console.log('✅ 优先选择同意');
      return {
        result: 'yes',
        confidence: 0.5,
        reasoning: '贤者意见分歧，按优先级选择同意。',
        consensusLevel: 'split'
      };
    } else {
      console.log('ℹ️ 默认选择信息状态');
      return {
        result: 'info',
        confidence: 0.3,
        reasoning: '贤者意见分歧，提供信息参考。',
        consensusLevel: 'split'
      };
    }
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