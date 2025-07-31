import os
import random
from dash.dependencies import Input, Output, State, ALL, MATCH
from dash import dcc, no_update
from ui_components import get_status_element

def register_api_callbacks(app):
    @app.callback(
        [
            Output('question', 'data'),
            Output({'type': 'wise-man', 'name': 'melchior'}, 'status', allow_duplicate=True),
            Output({'type': 'wise-man', 'name': 'balthasar'}, 'status', allow_duplicate=True),
            Output({'type': 'wise-man', 'name': 'casper'}, 'status', allow_duplicate=True),
            Output('magi', 'status', allow_duplicate=True),
            Output('status-refresh-trigger', 'data', allow_duplicate=True)
        ],
        Input('query', 'value'),
        State('question', 'data'),
        prevent_initial_call=True)
    def question(query: str, question: dict):
        if not query:
            return [no_update] * 6
        new_id = question.get('id', 0) + 1
        print(f"\n{'='*60}")
        print(f"🔍 新问题 [ID: {new_id}]: {query}")
        print(f"🔄 重置MAGI系统状态")
        print(f"{'='*60}")
        
        # 重置所有核心状态为standby，并触发状态数字刷新
        import time
        return [
            {'id': new_id, 'query': query},
            'standby',  # melchior
            'standby',  # balthasar  
            'standby',  # casper
            'standby',  # magi
            int(time.time() * 1000)  # 触发状态刷新的时间戳
        ]

    @app.callback(
        [
            Output({'type': 'wise-man', 'name': 'melchior'}, 'status'),
            Output('melchior-content', 'children'),
            Output('melchior-status', 'children'),
            Output({'type': 'wise-man', 'name': 'balthasar'}, 'status'),
            Output('balthasar-content', 'children'),
            Output('balthasar-status', 'children'),
            Output({'type': 'wise-man', 'name': 'casper'}, 'status'),
            Output('casper-content', 'children'),
            Output('casper-status', 'children'),
            Output('response', 'status'),
            Output('magi', 'status'),
            Output('query', 'value', allow_duplicate=True),
            Output('history-records', 'data', allow_duplicate=True)
        ],
        Input('ai-results-store', 'data'),
        State('history-records', 'data'),
        prevent_initial_call=True
    )
    def handle_ai_results(data, current_records):
        if not data:
            return [no_update] * 13

        question = data.get('question', {})
        answers = data.get('answers', [])

        if not question or not answers or len(answers) < 3:
            return [no_update] * 13

        # 1. 更新贤者面板
        melchior_answer = answers[0]
        balthasar_answer = answers[1]
        casper_answer = answers[2]

        melchior_content = melchior_answer.get('response', 'Error')
        melchior_status_element = get_status_element(melchior_answer.get('status', 'error'))
        balthasar_content = balthasar_answer.get('response', 'Error')
        balthasar_status_element = get_status_element(balthasar_answer.get('status', 'error'))
        casper_content = casper_answer.get('response', 'Error')
        casper_status_element = get_status_element(casper_answer.get('status', 'error'))

        # 2. 最终裁决 - 新的多数决机制
        def calculate_final_decision(answers):
            # 找到Casper的回答（第三个贤者）
            casper_answer = answers[2]  # casper是第三个
            
            # Casper的一票否决权：只对"no"状态生效
            if casper_answer['status'] == 'no':
                print(f"🚫 Casper行使一票否决权")
                return 'no'
            
            # 错误优先处理
            if any(a['status'] == 'error' for a in answers):
                return 'error'
            
            # 统计各状态票数
            status_counts = {}
            for answer in answers:
                status = answer['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            print(f"📊 投票统计: {status_counts}")
            
            # 找到得票最多的状态
            max_count = max(status_counts.values())
            
            # 如果有状态获得2票或以上，采用该状态
            if max_count >= 2:
                for status, count in status_counts.items():
                    if count == max_count:
                        print(f"✅ 多数决通过: {status} ({count}票)")
                        return status
            
            # 1:1:1的情况，按优先级处理
            print(f"⚖️  三方各异，按优先级处理")
            if 'conditional' in status_counts:
                return 'conditional'
            elif 'yes' in status_counts:
                return 'yes'
            else:
                return 'info'
        
        final_status = calculate_final_decision(answers)
        
        print(f"\n🏛️  MAGI系统综合决策 [ID: {question['id']}] - 状态: {final_status.upper()}")

        # 3. 保存历史记录
        import time
        import uuid
        
        # 为每个回答添加贤者名称
        answers_with_names = []
        wise_men = ['melchior', 'balthasar', 'casper']
        for i, ans in enumerate(answers):
            ans['name'] = wise_men[i]
            answers_with_names.append(ans)

        new_record = {
            'id': str(uuid.uuid4()),
            'timestamp': int(time.time() * 1000),
            'question': question['query'],
            'finalStatus': final_status,
            'answers': answers_with_names
        }
        updated_records = (current_records or []) + [new_record]
        print(f"📚 保存历史记录: {question['query'][:50]}...")

        # 4. 清空输入框
        cleared_query = ''

        return (
            melchior_answer.get('status', 'error'),
            melchior_content, melchior_status_element,
            balthasar_answer.get('status', 'error'),
            balthasar_content, balthasar_status_element,
            casper_answer.get('status', 'error'),
            casper_content, casper_status_element,
            final_status,
            final_status, # Also update the Magi component status
            cleared_query,
            updated_records
        )