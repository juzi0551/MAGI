from dotenv import load_dotenv
from dash import Dash, dcc, Input, Output, State, ALL
from dash.html import Div, Label, Img
from dash_local_react_components import load_react_component
from api_routes import register_api_callbacks
from history_manager import register_history_callbacks
from ui_components import get_status_element
from prompts import get_personality_prompt, YES_NO_QUESTION_PROMPT

# 加载环境变量
load_dotenv()

app = Dash(
    __name__,
    assets_folder='assets',
    title='MAGI 决策模拟系统',
    meta_tags=[{
        'name': 'description',
        'content': '一个基于 EVA 中 MAGI 超级计算机系统的网页模拟应用。输入您的问题，见证三贤人（科学家、母亲、女人）的审议过程，并获得最终决议。'
    }]
)
server = app.server

# 加载 React 组件
Magi = load_react_component(app, 'components', 'magi.js')
WiseMan = load_react_component(app, 'components', 'wise_man.js')
Response = load_react_component(app, 'components', 'response.js')
Header = load_react_component(app, 'components', 'header.js')
Status = load_react_component(app, 'components', 'status.js')
HistoryPanel = load_react_component(app, 'components', 'history_panel.js')
HistoryModal = load_react_component(app, 'components', 'history_modal.js')
SettingsModal = load_react_component(app, 'components', 'settings_modal.js')

app.layout = Div(
    id='app-container',
    className='system',
    children=[
        # 全局数据存储
        dcc.Store(id='audio-enabled', data=True),
        dcc.Store(id='audio-volume', data=30),
        dcc.Store(id='settings-modal-open', data=False),
        dcc.Store(id='user-config', storage_type='local'),
        
        dcc.Store(id='ai-results-store'),
        dcc.Store(id='yes-no-prompt-store', data=YES_NO_QUESTION_PROMPT),

        # 主界面
        Div(className='left-panel', children=[
            Magi(id='magi', children=[
                Header(side='left', title='提訴'),
                Header(side='right', title='決議'),
                Status(id='status', refreshTrigger=0),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'melchior'},
                    name='melchior',
                    order_number=1,
                    personality=get_personality_prompt('melchior')),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'balthasar'},
                    name='balthasar',
                    order_number=2,
                    personality=get_personality_prompt('balthasar')),
                WiseMan(
                    id={'type': 'wise-man', 'name': 'casper'},
                    name='casper',
                    order_number=3,
                    personality=get_personality_prompt('casper')),
                Response(id='response', status='standby')
            ]),
            HistoryPanel(
                id='history-panel',
                records=[],
                onQuestionSelect=None,
                onClearHistory=None,
                onRecordDetail=None
            ),
            Div(className='input-container', children=[
                Label('質問: '),
                dcc.Input(id='query', type='text', value='', debounce=True, autoComplete='off', autoFocus=True),
            ]),
        ]),
        
        Div(className='right-panel', children=[
            Div(id='open-settings-button', n_clicks=0, className='settings-icon', children=[
                Img(src='assets/setting.svg', style={'width': '28px', 'height': '28px'})
            ]),
            Div(className='wise-answers', children=[
                Div(id='melchior-answer', className='wise-answer melchior', children=[
                    Div(className='wise-answer-title', children=[
                        'MELCHIOR-1 (科学家)',
                        Div(id='melchior-status', children=get_status_element('standby'))
                    ]),
                    Div(id='melchior-content', className='answer-content', children='待機中...')
                ]),
                Div(id='balthasar-answer', className='wise-answer balthasar', children=[
                    Div(className='wise-answer-title', children=[
                        'BALTHASAR-2 (母亲)',
                        Div(id='balthasar-status', children=get_status_element('standby'))
                    ]),
                    Div(id='balthasar-content', className='answer-content', children='待機中...')
                ]),
                Div(id='casper-answer', className='wise-answer casper', children=[
                    Div(className='wise-answer-title', children=[
                        'CASPER-3 (女人)',
                        Div(id='casper-status', children=get_status_element('standby'))
                    ]),
                    Div(id='casper-content', className='answer-content', children='待機中...')
                ])
            ])
        ]),
        
        # 模态框
        HistoryModal(
            id='history-detail-modal',
            is_open=False,
            question=None,
            answer=None
        ),
        SettingsModal(
            id='settings-modal',
            isOpen=False
        ),

        # 旧的数据存储（待重构）
        dcc.Store(id='question', data={'id': 0, 'query': ''}),
        dcc.Store(id='annotated-question', data={'id': 0, 'query': '', 'is_yes_or_no_question': False}),
        dcc.Store(id='is_yes_or_no_question', data=False),
        dcc.Store(id='question-id', data=0),
        dcc.Store(id='history-records', data=[]),
        dcc.Store(id='status-refresh-trigger', data=0),
    ])

# 注册回调
register_api_callbacks(app)
register_history_callbacks(app)

# 状态刷新回调
@app.callback(
    Output('status', 'refreshTrigger'),
    Input('status-refresh-trigger', 'data'),
    prevent_initial_call=True
)
def update_status_refresh(trigger_data):
    return trigger_data

app.clientside_callback(
    """
    function(question) {
        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            return [window.dash_clientside.no_update] * 5;
        }

        if (question && question.query) {
            // 立即将最终状态设置为“审议中”
            return ['progress', 'progress', '思考中...', '思考中...', '思考中...'];
        }
        return [window.dash_clientside.no_update] * 5;
    }
    """,
    [
        Output('response', 'status', allow_duplicate=True),
        Output('magi', 'status', allow_duplicate=True),
        Output('melchior-content', 'children', allow_duplicate=True),
        Output('balthasar-content', 'children', allow_duplicate=True),
        Output('casper-content', 'children', allow_duplicate=True)
    ],
    Input('question', 'data'),
    prevent_initial_call=True
)

app.clientside_callback(
    """
    async function(question, personalities, yesNoPrompt) {
        if (!question || !question.query) {
            return [window.dash_clientside.no_update] * 2;
        }

        const config = window.ConfigStorage.getUserConfig();
        if (!config || !config.apiKey) {
            alert('请先在“设置”中配置您的 API 密钥。');
            return [window.dash_clientside.no_update, true];
        }

        console.log('🚀 前端开始处理问题:', question.query);

        try {
            // 1. 判断问题类型
            const isYesNo = await window.AiService.isYesNoQuestion(question, yesNoPrompt);
            console.log(`问题类型判断: ${isYesNo ? '是非题' : '开放性问题'}`);

            // 2. 获取回答
            const answers = await window.AiService.fetchMagiAnswers(question, personalities, isYesNo);
            console.log('✅ 前端收到所有回答:', answers);

            // 3. 附加问题类型信息
            const result = {
                question: { ...question, is_yes_or_no_question: isYesNo },
                answers: answers
            };
            return [result, window.dash_clientside.no_update];

        } catch (error) {
            console.error('前端处理失败:', error);
            const errorResponse = {
                question: question,
                answers: personalities.map(p => ({ id: question.id, response: error.message, status: 'error' }))
            };
            return [errorResponse, window.dash_clientside.no_update];
        }
    }
    """,
    [Output('ai-results-store', 'data'),
     Output('settings-modal', 'isOpen', allow_duplicate=True)],
    Input('question', 'data'),
    [State({'type': 'wise-man', 'name': ALL}, 'personality'),
     State('yes-no-prompt-store', 'data')],
    prevent_initial_call=True
)


# 设置模态框回调
@app.callback(
    Output('settings-modal', 'isOpen'),
    Input('open-settings-button', 'n_clicks'),
    State('settings-modal', 'isOpen'),
    prevent_initial_call=True
)
def toggle_settings_modal(n_clicks, is_open):
    if n_clicks:
        return not is_open
    return is_open


app.clientside_callback(
    """
    function(save_data) {
        if (save_data && window.ConfigStorage) {
            window.ConfigStorage.saveUserConfig(save_data);
        }
        return window.dash_clientside.no_update;
    }
    """,
    Output('user-config', 'data', allow_duplicate=True),
    Input('settings-modal', 'onSave'),
    prevent_initial_call=True
)

app.clientside_callback(
    """
    function(clear_data) {
        if (clear_data && window.ConfigStorage) {
            window.ConfigStorage.clearUserConfig();
        }
        return window.dash_clientside.no_update;
    }
    """,
    Output('user-config', 'data', allow_duplicate=True),
    Input('settings-modal', 'onClear'),
    prevent_initial_call=True
)


# 音效集成 - 客户端回调
app.clientside_callback(
    """
    function(audio_enabled, audio_volume) {
        if (window.MagiAudio) {
            window.MagiAudio.setEnabled(audio_enabled);
            window.MagiAudio.setVolume(audio_volume / 100);
            console.log('🔊 MAGI音效设置更新:', {enabled: audio_enabled, volume: audio_volume + '%'});
        }
        return window.dash_clientside.no_update;
    }
    """,
    Output('audio-enabled', 'data', allow_duplicate=True),
    [Input('audio-enabled', 'data'),
     Input('audio-volume', 'data')],
    prevent_initial_call=True
)

app.clientside_callback(
    """
    function(status, audio_enabled) {
        if (!audio_enabled || !window.MagiAudio || status === 'progress' || status === 'standby') {
            return window.dash_clientside.no_update;
        }
        
        console.log('🎵 MAGI决议状态变化:', status);
        
        let frequency;
        switch (status) {
            case 'yes':
                frequency = 2000;
                break;
            case 'no':
            case 'error':
                frequency = 3400;
                break;
            case 'conditional':
                frequency = 2700;
                break;
            case 'info':
            default:
                frequency = 2200;
                break;
        }
        window.MagiAudio.playOscillator(frequency);
        console.log('✅ 播放决议音效:', status, frequency);
        
        return window.dash_clientside.no_update;
    }
    """,
    Output('response', 'status', allow_duplicate=True),
    [Input('response', 'status'),
     Input('audio-enabled', 'data')],
    prevent_initial_call=True
)



if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=8050)


