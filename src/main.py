import os
from dotenv import load_dotenv
from dash import Dash, Input, Output, State, callback, ALL, MATCH, dcc
from dash.html import Div, Label
from dash_local_react_components import load_react_component
import ai

# 加载环境变量
load_dotenv()

app = Dash(__name__)

Magi = load_react_component(app, 'components', 'magi.js')
WiseMan = load_react_component(app, 'components', 'wise_man.js')
Response = load_react_component(app, 'components', 'response.js')
Modal = load_react_component(app, 'components', 'modal.js')
Header = load_react_component(app, 'components', 'header.js')
Status = load_react_component(app, 'components', 'status.js')
HistoryPanel = load_react_component(app, 'components', 'history_panel.js')

def get_status_element(status_key):
    """根据状态键返回带样式的状态元素"""
    status_config = {
        'standby': {'text': '待 機', 'color': '#ff8d00', 'bg': '#ff8d00', 'text_color': 'black'},
        'progress': {'text': '審議中', 'color': '#ff8d00', 'bg': '#ff8d00', 'text_color': 'black'},
        'yes': {'text': '可 決', 'color': '#52e691', 'bg': '#52e691', 'text_color': 'black'},
        'no': {'text': '否 決', 'color': '#a41413', 'bg': '#a41413', 'text_color': 'white'},
        'conditional': {'text': '状 態', 'color': '#ff8d00', 'bg': '#ff8d00', 'text_color': 'black'},
        'error': {'text': '誤 差', 'color': 'gray', 'bg': 'gray', 'text_color': 'white'},
        'info': {'text': '情 報', 'color': '#3caee0', 'bg': '#3caee0', 'text_color': 'black'}
    }
    
    config = status_config.get(status_key, status_config['standby'])
    
    return Div(
        config['text'],
        className='answer-status',
        style={
            'borderColor': config['color'],
            'backgroundColor': config['bg'],
            'color': config['text_color']
        }
    )

app.layout = Div(
    className='system',
    children=[
        # 左侧面板 - 原有的MAGI系统
        Div(className='left-panel', children=[
            Magi(id='magi', children=[
                Header(side='left', title='提訴'),
                Header(side='right', title='決議'),
                Status(id='status'),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'melchior'},
                    name='melchior',
                    order_number=1,
                    personality='You are a scientist. Your goal is to further our understanding of the universe and advance our technological progress.'),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'balthasar'},
                    name='balthasar',
                    order_number=2,
                    personality='You are a mother. Your goal is to protect your children and ensure their well-being.'),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'casper'},
                    name='casper',
                    order_number=3,
                    personality='You are a woman. Your goal is to pursue love, dreams and desires.'),
                Response(id='response', status='standby')
            ]),
            # 历史记录面板
            HistoryPanel(
                id='history-panel',
                records=[],
                onQuestionSelect=None,
                onClearHistory=None
            ),
            # 问题输入框移到左侧面板
            Div(className='input-container', children=[
                Label('问题: '),
                dcc.Input(id='query', type='text', value='', debounce=True, autoComplete='off', autoFocus=True),
            ]),
        ]),
        
        # 右侧面板 - 三个核心的回答
        Div(className='right-panel', children=[
            Div(className='wise-answers', children=[
                Div(id='melchior-answer', className='wise-answer melchior', children=[
                    Div('MELCHIOR-1 (科学家)', className='wise-answer-title'),
                    Div(id='melchior-content', className='answer-content', children='待機中...'),
                    Div(id='melchior-status', children=get_status_element('standby'))
                ]),
                Div(id='balthasar-answer', className='wise-answer balthasar', children=[
                    Div('BALTHASAR-2 (母亲)', className='wise-answer-title'),
                    Div(id='balthasar-content', className='answer-content', children='待機中...'),
                    Div(id='balthasar-status', children=get_status_element('standby'))
                ]),
                Div(id='casper-answer', className='wise-answer casper', children=[
                    Div('CASPER-3 (女人)', className='wise-answer-title'),
                    Div(id='casper-content', className='answer-content', children='待機中...'),
                    Div(id='casper-status', children=get_status_element('standby'))
                ])
            ])
        ]),
        
        Modal(id={'type': 'modal', 'name': 'melchior'}, name='melchior'),
        Modal(id={'type': 'modal', 'name': 'balthasar'}, name='balthasar'),
        Modal(id={'type': 'modal', 'name': 'casper'}, name='casper'),

        dcc.Store(id='question', data={'id': 0, 'query': ''}),
        dcc.Store(id='annotated-question', data={'id': 0, 'query': '', 'is_yes_or_no_question': False}),
        dcc.Store(id='is_yes_or_no_question', data=False),
        dcc.Store(id='question-id', data=0),
        dcc.Store(id='history-records', data=[]),
    ])


@callback(
    Output('question', 'data'),
    Input('query', 'value'),
    State('question', 'data'),
    prevent_initial_call=True)
def question(query: str, question: dict):
    new_id = question['id'] + 1
    print(f"\n{'='*60}")
    print(f"🔍 新问题 [ID: {new_id}]: {query}")
    print(f"{'='*60}")
    return {'id': new_id, 'query': query}


@callback(
    Output('annotated-question', 'data'),
    Input('question', 'data'),
    prevent_initial_call=True)
def annotated_question(question: dict):
    print(f"\n📋 第一步：判断问题类型 [ID: {question['id']}]")
    print(f"问题: {question['query']}")
    
    try:
        # 使用环境变量中的配置
        provider = os.getenv('DEFAULT_PROVIDER', 'openrouter')
        api_key = os.getenv('OPENROUTER_API_KEY', '')
        model = os.getenv('OPENROUTER_MODEL', 'google/gemini-2.5-flash')
        
        print(f"🔧 配置: 提供商={provider}, 模型={model}")
        print(f"🚀 正在调用AI判断问题类型...")
        
        is_yes_or_no_question = ai.is_yes_or_no_question(question['query'], api_key, provider, model)
        
        question_type = "是非题" if is_yes_or_no_question else "开放性问题"
        print(f"✅ 问题类型判断完成: {question_type}")
        print(f"📊 状态码将设置为: {'7312' if is_yes_or_no_question else '3023'}")

        return {
            'id': question['id'],
            'query': question['query'],
            'is_yes_or_no_question': is_yes_or_no_question,
            'error': None
        }
    except Exception as e:
        print(f"❌ 问题类型判断失败: {str(e)}")
        return {
            'id': question['id'],
            'query': question['query'],
            'is_yes_or_no_question': False,
            'error': str(e)
        }


@callback(
    Output('status', 'extention'),
    Input('question', 'data'),
    Input('annotated-question', 'data'))
def extention(question: dict, annotated_question: dict):
    if question['id'] != annotated_question['id']:
        print(f"⚠️  ID不匹配，等待同步... (问题ID: {question['id']}, 注释ID: {annotated_question['id']})")
        return '????'

    status_code = '7312' if annotated_question['is_yes_or_no_question'] else '3023'
    question_type = "是非题" if annotated_question['is_yes_or_no_question'] else "开放性问题"
    print(f"📡 MAGI状态码更新: {status_code} ({question_type})")
    
    return status_code


@callback(
    Output({'type': 'wise-man', 'name': MATCH}, 'answer'),
    Input('annotated-question', 'data'),
    State({'type': 'wise-man', 'name': MATCH}, 'personality'),
    prevent_initial_call=True)
def wise_man_answer(question: dict, personality: str):
    # 获取人格名称用于显示
    personality_names = {
        'You are a scientist. Your goal is to further our understanding of the universe and advance our technological progress.': 'Melchior (科学家)',
        'You are a mother. Your goal is to protect your children and ensure their well-being.': 'Balthasar (母亲)',
        'You are a woman. Your goal is to pursue love, dreams and desires.': 'Casper (女性)'
    }
    
    personality_name = personality_names.get(personality, personality[:20] + "...")
    
    print(f"\n🤖 第二步：{personality_name} 开始思考 [ID: {question['id']}]")
    
    if question['error']:
        print(f"❌ {personality_name} 收到错误: {question['error']}")
        return {'id': question['id'], 'response': question['error'], 'status': 'error'}

    try:
        # 使用环境变量中的配置
        provider = os.getenv('DEFAULT_PROVIDER', 'openrouter')
        api_key = os.getenv('OPENROUTER_API_KEY', '')
        model = os.getenv('OPENROUTER_MODEL', 'google/gemini-2.5-flash')
        
        question_type = "是非题" if question['is_yes_or_no_question'] else "开放性问题"
        print(f"📝 {personality_name} 处理{question_type}: {question['query']}")
        print(f"🚀 正在调用AI生成回答...")
        
        # 使用优化后的结构化回答函数
        response_content = ai.get_structured_answer(
            question['query'], 
            personality, 
            question['is_yes_or_no_question'], 
            api_key, 
            provider, 
            model
        )
        
        print(f"📥 {personality_name} 原始响应:")
        print(f"   {response_content[:200]}{'...' if len(response_content) > 200 else ''}")

        # 解析响应
        answer, classification = ai.parse_structured_response(
            response_content, 
            question['is_yes_or_no_question']
        )
        
        print(f"📤 {personality_name} 解析结果:")
        print(f"   回答: {answer[:100]}{'...' if len(str(answer)) > 100 else ''}")
        print(f"   分类: {classification['status']}")
        if classification.get('conditions'):
            print(f"   条件: {str(classification['conditions'])[:100]}{'...' if len(str(classification.get('conditions', ''))) > 100 else ''}")

        return {
            'id': question['id'], 
            'response': answer, 
            'status': classification['status'], 
            'conditions': classification.get('conditions'), 
            'error': None
        }

    except Exception as e:
        print(f"❌ {personality_name} 处理失败: {str(e)}")
        return {'id': question['id'], 'response': None, 'status': 'error', 'conditions': None, 'error': str(e)}


@callback(
    Output({'type': 'wise-man', 'name': MATCH}, 'question_id'),
    Input('question', 'data'))
def wise_man_question_id(question: dict):
    return question['id']


@callback(
    Output('response', 'question_id'),
    Input('question', 'data'))
def response_question_id(question: dict):
    return question['id']


@callback(
    Output('response', 'status', allow_duplicate=True),
    Input('question', 'data'),
    prevent_initial_call=True)
def response_progress_status(question: dict):
    # 当有新问题时，立即显示审议中状态
    if question and question.get('query'):
        return 'progress'
    return 'standby'


@callback(
    Output('response', 'status'),
    Output('response', 'answer_id'),
    Input({'type': 'wise-man', 'name': ALL}, 'answer'),
    Input('question', 'data'),
    prevent_initial_call=True)
def response_status(answers: list, question: dict):
    # 如果没有问题，返回待机状态
    if not question or not question.get('query'):
        return 'standby', 0
    
    # 如果还没有收到所有回答，显示审议中状态
    if not answers or len(answers) < 3 or any(not answer for answer in answers):
        return 'progress', question['id']
    
    answer_id = min([answer['id'] for answer in answers])
    
    print(f"\n🏛️  第三步：MAGI系统综合决策 [ID: {answer_id}]")
    print(f"收到 {len(answers)} 个贤者的回答:")
    
    # 显示每个贤者的状态
    personality_names = ['Melchior (科学家)', 'Balthasar (母亲)', 'Casper (女性)']
    for i, answer in enumerate(answers):
        name = personality_names[i] if i < len(personality_names) else f"贤者{i+1}"
        print(f"   {name}: {answer['status']}")
    
    status = 'info'

    if any([answer['status'] == 'error' for answer in answers]):
        status = 'error'
        print(f"❌ 最终决策: ERROR (有贤者出现错误)")
    elif any([answer['status'] == 'no' for answer in answers]):
        status = 'no'
        print(f"🚫 最终决策: NO (至少一个贤者反对)")
    elif any([answer['status'] == 'conditional' for answer in answers]):
        status = 'conditional'
        print(f"⚠️  最终决策: CONDITIONAL (有条件同意)")
    elif all([answer['status'] == 'yes' for answer in answers]):
        status = 'yes'
        print(f"✅ 最终决策: YES (所有贤者同意)")
    else:
        print(f"ℹ️  最终决策: INFO (信息性回答)")

    print(f"{'='*60}")
    print(f"🎯 MAGI系统决策完成 [ID: {answer_id}] - 状态: {status.upper()}")
    print(f"{'='*60}\n")

    return status, answer_id


@callback(
    Output({'type': 'modal', 'name': MATCH}, 'is_open'),
    Input({'type': 'wise-man', 'name': MATCH}, 'n_clicks'),
    prevent_initial_call=True)
def modal_visibility(n_clicks):
    if n_clicks and n_clicks > 0:
        return True
    return False


@callback(
    Output({'type': 'modal', 'name': MATCH}, 'question'),
    Output({'type': 'modal', 'name': MATCH}, 'answer'),
    Input('question', 'data'),
    Input({'type': 'wise-man', 'name': MATCH}, 'answer'))
def modal_content(question: dict, answer: dict):
    return question, answer


@callback(
    Output('melchior-content', 'children'),
    Output('melchior-status', 'children'),
    Input({'type': 'wise-man', 'name': 'melchior'}, 'answer'))
def update_melchior_answer(answer: dict):
    if answer and answer.get('response'):
        status_key = answer.get('status', 'info')
        return str(answer['response']), get_status_element(status_key)
    return '待機中...', get_status_element('standby')


@callback(
    Output('balthasar-content', 'children'),
    Output('balthasar-status', 'children'),
    Input({'type': 'wise-man', 'name': 'balthasar'}, 'answer'))
def update_balthasar_answer(answer: dict):
    if answer and answer.get('response'):
        status_key = answer.get('status', 'info')
        return str(answer['response']), get_status_element(status_key)
    return '待機中...', get_status_element('standby')


@callback(
    Output('casper-content', 'children'),
    Output('casper-status', 'children'),
    Input({'type': 'wise-man', 'name': 'casper'}, 'answer'))
def update_casper_answer(answer: dict):
    if answer and answer.get('response'):
        status_key = answer.get('status', 'info')
        return str(answer['response']), get_status_element(status_key)
    return '待機中...', get_status_element('standby')


# 历史记录相关回调函数
@callback(
    [Output('history-records', 'data'),
     Output('history-panel', 'records')],
    [Input('response', 'status'),
     Input('history-panel', 'onQuestionSelect'),
     Input('history-panel', 'onClearHistory')],
    [State('question', 'data'),
     State({'type': 'wise-man', 'name': ALL}, 'answer'),
     State('history-records', 'data'),
     State('query', 'value')],
    prevent_initial_call=True
)
def manage_history(status, selected_question, clear_trigger, question, answers, current_records, current_query):
    """统一管理历史记录相关操作"""
    import time
    import uuid
    from dash import callback_context
    
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
        # 只有当问题处理完成且有有效答案时才保存
        if (question and question.get('query') and answers and len(answers) >= 3 and
            all(answer and answer.get('response') for answer in answers)):
            
            # 创建历史记录项
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
            
            # 添加到历史记录
            updated_records = (current_records or []).copy()
            updated_records.append(record)
            
            print(f"📚 保存历史记录: {question['query'][:50]}... (状态: {status})")
            
            return updated_records, updated_records
    
    # 默认返回当前记录
    return current_records or [], current_records or []


@callback(
    Output('query', 'value', allow_duplicate=True),
    Input('history-panel', 'onQuestionSelect'),
    prevent_initial_call=True
)
def reask_from_history(selected_question):
    """从历史记录重新提问"""
    if selected_question:
        print(f"🔄 从历史记录重新提问: {selected_question[:50]}...")
        return selected_question
    return ''




if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=8050)
