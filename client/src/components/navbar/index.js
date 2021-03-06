import React, {Component} from 'react'
import { Route, Link } from 'react-router-dom'

const template = pug`
    nav.navbar.navbar-expand-lg.navbar-dark.bg-dark
        a.navbar-brand(href="#") DWM
        button.navbar-toggler(type="button", data-toggle="collapse", data-target="#navbarSupportedContent", aria-controls="navbarSupportedContent", aria-expanded="false", aria-label="Toggle navigation")
            span.navbar-toggler-icon
        #navbarSupportedContent.collapse.navbar-collapse
            ul.navbar-nav.mr-auto
                li.nav-item.active
                    Link.nav-link(to="/")
                        | Home 
                        span.sr-only (current)
                li.nav-item
                    Link.nav-link(to="/chat") Chat
                li.nav-item
                    Link.nav-link(to="/draw") Draw
                //- li.nav-item.dropdown
                    a#navbarDropdown.nav-link.dropdown-toggle(href="#", role="button", data-toggle="dropdown", aria-haspopup="true", aria-expanded="false")
                        | Dropdown
                    .dropdown-menu(aria-labelledby="navbarDropdown")
                        a.dropdown-item(href="#") Action
                        a.dropdown-item(href="#") Another action
                        .dropdown-divider
                        a.dropdown-item(href="#") Something else here
                //- li.nav-item
                    a.nav-link.disabled(href="#") Disabled
            //- form.form-inline.my-2.my-lg-0
                input.form-control.mr-sm-2(type="search", placeholder="Search", aria-label="Search")
                button.btn.btn-outline-success.my-2.my-sm-0(type="submit") Search
`

class Navbar extends Component {
    render() {
        return pug`=template`
    }
}

export default Navbar
