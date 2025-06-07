# -*- coding: utf-8 -*-
{
    'name': "Pos Customer Search",
    'summary': "search & create customer",
    'author': "Ayman",
    'category': 'Uncategorized',
    'version': '0.1',
    'depends': ['point_of_sale'],
    'data': [
    ],
    'assets': {
        'point_of_sale.assets': [
            'pos_customer_search/static/src/css/partner_search_bar.css',

        ],
        'web.assets_backend': [
            'pos_customer_search/static/src/js/custo_partne_button1.js',
            'pos_customer_search/static/src/js/partner_loader.js',
        ],
        'web.assets_qweb': [
            'pos_customer_search/static/src/xml/custo_partne_button_view1.xml',
        ],
    },
}

