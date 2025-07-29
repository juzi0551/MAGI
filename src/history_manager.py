import time
import uuid
import os
from dash.dependencies import Input, Output, State, ALL
from dash import callback_context, no_update

# 这是一个示例，实际应用中您可能需要更持久的存储方案
history_records = []

def register_history_callbacks(app):
    @app.callback(
        [Output('history-records', 'data'),
         Output('history-panel', 'records')],
        [Input('response', 'status'),
         Input('history-panel', 'onClearHistory')],
        [State('question', 'data'),
         State({'type': 'wise-man', 'name': ALL}, 'answer'),
         State('history-records', 'data'),
         State('query', 'value')],
        prevent_initial_call=True
    )
    def manage_history(status, clear_trigger, question, answers, current_records, current_query):
        """统一管理历史记录相关操作"""
        ctx = callback_context
        if not ctx.triggered:
            return current_records or [], current_records or []

        trigger_id = ctx.triggered[0]['prop_id']

        # 清空历史记录
        if 'onClearHistory' in trigger_id and clear_trigger:
            print("🗑️ 清空历史记录")
            return [], []

        # 保存新的问答记录
        if 'response.status' in trigger_id:
            if (question and question.get('query') and answers and len(answers) >= 3 and
                all(answer and answer.get('response') for answer in answers)):
                
                record = {
                    'id': str(uuid.uuid4()),
                    'timestamp': int(time.time() * 1000),
                    'question': question['query'],
                    'questionType': 'yes_no' if question.get('is_yes_or_no_question', False) else 'info',
                    'finalStatus': status,
                    'answers': [
                        {
                            'name': 'melchior',
                            'status': answers[0].get('status', 'info'),
                            'response': str(answers[0].get('response', '')),
                            'conditions': answers[0].get('conditions')
                        },
                        {
                            'name': 'balthasar', 
                            'status': answers[1].get('status', 'info'),
                            'response': str(answers[1].get('response', '')),
                            'conditions': answers[1].get('conditions')
                        },
                        {
                            'name': 'casper',
                            'status': answers[2].get('status', 'info'), 
                            'response': str(answers[2].get('response', '')),
                            'conditions': answers[2].get('conditions')
                        }
                    ],
                    'metadata': {
                        'provider': os.getenv('DEFAULT_PROVIDER', 'openrouter'),
                        'model': os.getenv('OPENROUTER_MODEL', 'gemini-2.5-flash'),
                        'processingTime': 0
                    }
                }
                
                updated_records = (current_records or []).copy()
                updated_records.append(record)
                
                print(f"📚 保存历史记录: {question['query'][:50]}... (状态: {status})")
                
                return updated_records, updated_records

        return current_records or [], current_records or []

    @app.callback(
        Output('history-detail-modal', 'is_open', allow_duplicate=True),
        Output('history-detail-modal', 'question', allow_duplicate=True),
        Output('history-detail-modal', 'answer', allow_duplicate=True),
        Input('history-panel', 'onRecordDetail'),
        prevent_initial_call=True
    )
    def show_history_detail(record_detail):
        """显示历史记录详情modal"""
        if record_detail:
            print(f"📖 打开历史记录详情: {record_detail.get('question', '')[:50]}...")
            
            question_data = {
                'id': record_detail.get('id'),
                'query': record_detail.get('question'),
                'timestamp': record_detail.get('timestamp'),
                'is_yes_or_no_question': record_detail.get('questionType') == 'yes_no'
            }
            
            answer_data = {
                'finalStatus': record_detail.get('finalStatus'),
                'answers': record_detail.get('answers', [])
            }
            
            return True, question_data, answer_data
        
        return no_update, no_update, no_update

    # 客户端回调
    app.clientside_callback(
        """
        function(records) {
            if (window.HistoryStorage) {
                window.HistoryStorage.clearAll();
                if (records && records.length > 0) {
                    records.forEach(record => {
                        window.HistoryStorage.saveRecord(record);
                    });
                    console.log('📚 已保存', records.length, '条历史记录到localStorage');
                } else {
                    console.log('🗑️ 已清空localStorage中的历史记录');
                }
            }
            return window.dash_clientside.no_update;
        }
        """,
        Output('history-records', 'data', allow_duplicate=True),
        Input('history-records', 'data'),
        prevent_initial_call=True
    )

    app.clientside_callback(
        """
        function(panel_id) {
            if (window.HistoryStorage && window.HistoryStorage.isAvailable()) {
                const loadedRecords = window.HistoryStorage.getRecords();
                console.log('🔄 从localStorage加载了', loadedRecords.length, '条历史记录');
                return [loadedRecords, loadedRecords];
            }
            console.log('⚠️ localStorage不可用或HistoryStorage未加载');
            return [[], []];
        }
        """,
        [Output('history-records', 'data', allow_duplicate=True),
         Output('history-panel', 'records', allow_duplicate=True)],
        Input('history-panel', 'id'),
        prevent_initial_call='initial_duplicate'
    )
