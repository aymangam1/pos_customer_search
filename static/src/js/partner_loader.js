odoo.define('owl_pos.partner_loader', function (require) {
    'use strict';

    const models = require('point_of_sale.models');

    const partnerModel = models.PosModel.prototype.models.find(model => model.model === 'res.partner');

    if (partnerModel) {
        if (!partnerModel.fields.includes('customer_rank')) {
            partnerModel.fields.push('customer_rank');
        }

        const originalLoaded = partnerModel.loaded;
        partnerModel.loaded = function (self, partners) {
            const customers = partners.filter(p => p.customer_rank && p.customer_rank > 0);
            self.db.add_partners(customers);
            self.partners = customers;
        };
    }
});
