from dash.html import Div

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
