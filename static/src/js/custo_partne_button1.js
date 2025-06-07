/** @odoo-module **/

import { Component, useRef } from "@odoo/owl";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useService } from "@web/core/utils/hooks";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { SelectionPopup } from "@point_of_sale/app/utils/input_popups/selection_popup";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";

export class CustomPartnerSearchBar extends Component {
    static template = 'CustomPartnerSearchBar';

    setup() {
        this.pos = usePos();
        this.popup = useService("popup");
        this.searchInputRef = useRef("search-word-input-partner");
        this.orm = useService('orm');
    }

    get currentOrder() {
        return this.pos.get_order();
    }

    updatePartnerList() {
        const searchQuery = this.searchInputRef.el.value.trim().toLowerCase();
        if (!searchQuery) return;

        const matched = this.pos.db.get_partners_sorted().filter(p =>
            p.name.toLowerCase().includes(searchQuery)
        );

        if (matched.length > 0) {
            this.showPartnerList(matched);
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

        const { confirmed, payload } = await this.popup.add(SelectionPopup, {
            title: "Search Results",
            list: partnerList,
        });

        if (confirmed) {
            this.currentOrder.set_partner(payload);
        }
    }

    showErrorPopup(message) {
        const { confirmed } = this.env.services.popup.add(ConfirmPopup, {
            title: "Error",
            body: message,
        });

        if (confirmed) {
            console.log("Popup confirmed");
        }
    }

    async createNewCustomer() {
        const name = this.searchInputRef.el.value.trim();
        if (!name) {
            this.showErrorPopup("Please enter a valid name.");
            return;
        }

        const exists = this.pos.db.get_partners_sorted().some(p =>
            p.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            this.showErrorPopup("Customer already exists.");
            return;
        }

        const newId = await this.orm.call(
           'res.partner',
             'create',
            [{ name }],
        );
        console.log('=========>', newId)

        await this.pos._loadPartners([newId]);
        const newPartner = this.pos.db.get_partner_by_id(newId);
        this.currentOrder.set_partner(newPartner);
    }

    _clearSearch() {
        this.searchInputRef.el.value = '';
        this.searchInputRef.el.focus();
    }

    _onPressEnterKey() {
        this.updatePartnerList();
    }
}
ProductScreen.addControlButton({
    component: CustomPartnerSearchBar,
    condition: () => true,
});
