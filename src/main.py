import os
from dotenv import load_dotenv
from dash import Dash, dcc, Input, Output
from dash.html import Div, Label
from dash_local_react_components import load_react_component
from api_routes import register_api_callbacks
from history_manager import register_history_callbacks
from ui_components import get_status_element

# 加载环境变量
load_dotenv()

app = Dash(
    __name__,
    assets_folder='assets',
    title='MAGI 决策模拟系统',
    meta_tags=[{
        'name': 'description',
        'content': '一个基于 EVA 中 MAGI 超级计算机系统的网页模拟应用。输入您的问题，见证三贤者（科学家、母亲、女人）的审议过程，并获得最终决议。'
    }]
)

Magi = load_react_component(app, 'components', 'magi.js')
WiseMan = load_react_component(app, 'components', 'wise_man.js')
Response = load_react_component(app, 'components', 'response.js')
Header = load_react_component(app, 'components', 'header.js')
Status = load_react_component(app, 'components', 'status.js')
HistoryPanel = load_react_component(app, 'components', 'history_panel.js')
HistoryModal = load_react_component(app, 'components', 'history_modal.js')

app.layout = Div(
    className='system',
    children=[
        dcc.Store(id='audio-enabled', data=True),
        dcc.Store(id='audio-volume', data=30),
        
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
            HistoryPanel(
                id='history-panel',
                records=[],
                onQuestionSelect=None,
                onClearHistory=None,
                onRecordDetail=None
            ),
            Div(className='input-container', children=[
                Label('问题: '),
                dcc.Input(id='query', type='text', value='', debounce=True, autoComplete='off', autoFocus=True),
            ]),
        ]),
        
        Div(className='right-panel', children=[
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
        
        HistoryModal(
            id='history-detail-modal',
            is_open=False,
            question=None,
            answer=None
        ),

        dcc.Store(id='question', data={'id': 0, 'query': ''}),
        dcc.Store(id='annotated-question', data={'id': 0, 'query': '', 'is_yes_or_no_question': False}),
        dcc.Store(id='is_yes_or_no_question', data=False),
        dcc.Store(id='question-id', data=0),
        dcc.Store(id='history-records', data=[]),
    ])

register_api_callbacks(app)
register_history_callbacks(app)

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

app.clientside_callback(
    """
    function(audio_enabled) {
        if (!window.MagiAudio) {
            const script = document.createElement('script');
            script.src = '/assets/magi_audio.js';
            script.onload = function() {
                console.log('🎵 MAGI音频系统已加载');
            };
            document.head.appendChild(script);
        }
        return window.dash_clientside.no_update;
    }
    """,
    Output('audio-enabled', 'data', allow_duplicate=True),
    Input('audio-enabled', 'data'),
    prevent_initial_call='initial_duplicate'
)

if __name__ == '__main__':
    app.run(debug=False, host='127.0.0.1', port=8050)