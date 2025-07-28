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

app.layout = Div(
    className='system',
    children=[
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
            Response(id='response', status='info')
        ]),
        Div(className='input-container', children=[
            Label('问题: '),
            dcc.Input(id='query', type='text', value='', debounce=True, autoComplete='off'),
        ]),
        Modal(id={'type': 'modal', 'name': 'melchior'}, name='melchior'),
        Modal(id={'type': 'modal', 'name': 'balthasar'}, name='balthasar'),
        Modal(id={'type': 'modal', 'name': 'casper'}, name='casper'),

        dcc.Store(id='question', data={'id': 0, 'query': ''}),
        dcc.Store(id='annotated-question', data={'id': 0, 'query': '', 'is_yes_or_no_question': False}),
        dcc.Store(id='is_yes_or_no_question', data=False),
        dcc.Store(id='question-id', data=0),
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
    Output('response', 'status'),
    Output('response', 'answer_id'),
    Input({'type': 'wise-man', 'name': ALL}, 'answer'),
    prevent_initial_call=True)
def response_status(answers: list):
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


if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=8050)
