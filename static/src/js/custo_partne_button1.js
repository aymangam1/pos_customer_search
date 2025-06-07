odoo.define('owl_pos.CustomPartnerSearchBar', function (require) {
    "use strict";

    const { Gui } = require('point_of_sale.Gui');
    const PosComponent = require('point_of_sale.PosComponent');
    const Registries = require('point_of_sale.Registries');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require("@web/core/utils/hooks");
    const { useRef } = owl.hooks;

    class CustomPartnerSearchBar extends PosComponent {
        setup() {
            super.setup();
            this.searchInputRef = useRef('search-word-input-partner');
            this.partners = this.env.pos.db.get_partners_sorted();
        }

        get currentOrder() {
            return this.env.pos.get_order();
        }

        updatePartnerList(event) {
            const searchQuery = this.searchInputRef.el.value.trim().toLowerCase();
            if (searchQuery === '') {
                return;
            }

            const matchedPartners = this.partners.filter(partner =>
                partner.name.toLowerCase().includes(searchQuery)
            );

            if (matchedPartners.length > 0) {
                this.showErrorPopup("loading.....");
                this.showPartnerList(matchedPartners);
            } else {
                this.showErrorPopup("No matching customers found.");
            }
        }

        async showPartnerList(partners) {
            const partnerList = partners.map(partner => ({
                id: partner.id,
                label: partner.name,
                item: partner,
            }));

            const { confirmed, payload: selectedPartner } = await this.showPopup(
                'SelectionPopup',
                {
                    title: this.env._t('Search Results'),
                    list: partnerList,
                }
            );

            if (confirmed) {
                this.currentOrder.set_client(selectedPartner);
            }
        }

        showErrorPopup(message) {
            Gui.showPopup("ErrorPopup", {
                title: "Error",
                body: message,
            });
        }

        async createNewCustomer() {
            const customerName = this.searchInputRef.el.value.trim();

            if (!customerName) {
                this.showErrorPopup("Please enter a valid customer name.");
                return;
            }

            const existingPartner = this.partners.find(partner =>
                partner.name.toLowerCase() === customerName.toLowerCase()
            );

            if (existingPartner) {
                this.showErrorPopup("Customer already exists.");
                return;
            }

            const newCustomer = await this._createCustomer(customerName);
            if (newCustomer) {
                this.currentOrder.set_client(newCustomer);
            }
        }

        async _createCustomer(customerName) {
            const customer = await this.rpc({
                model: 'res.partner',
                method: 'create',
                args: [{
                    name: customerName,
                }],
            });
            await this.env.pos._loadPartners([customer]);

            const selectedPartner = this.env.pos.db.get_partner_by_id(customer);
            this.currentOrder.set_client(selectedPartner);
        }



        _clearSearch() {
            this.searchInputRef.el.value = '';
            this.searchInputRef.el.focus();
        }

        _onPressEnterKey() {
            this.updatePartnerList();
        }
    }

    CustomPartnerSearchBar.template = 'CustomPartnerSearchBar';

    ProductScreen.addControlButton({
        component: CustomPartnerSearchBar,
        condition: function() {
            return this.env.pos;
        },
    });

    Registries.Component.add(CustomPartnerSearchBar);
});
