/* Cấu hình sinh css/base/utilities.css cho các trang khách tham quan.
   Màu lấy từ biến CSS trong css/base/design-tokens.css. Xem tools/tailwind/README.md. */
module.exports = {
  "darkMode": "class",
  "theme": {
    "extend": {
      "colors": {
        "background": "rgb(var(--hh-background) / <alpha-value>)",
        "error": "rgb(var(--hh-error) / <alpha-value>)",
        "error-container": "rgb(var(--hh-error-container) / <alpha-value>)",
        "inverse-on-surface": "rgb(var(--hh-inverse-on-surface) / <alpha-value>)",
        "inverse-primary": "rgb(var(--hh-inverse-primary) / <alpha-value>)",
        "inverse-surface": "rgb(var(--hh-inverse-surface) / <alpha-value>)",
        "on-background": "rgb(var(--hh-on-background) / <alpha-value>)",
        "on-error": "rgb(var(--hh-on-error) / <alpha-value>)",
        "on-error-container": "rgb(var(--hh-on-error-container) / <alpha-value>)",
        "on-primary": "rgb(var(--hh-on-primary) / <alpha-value>)",
        "on-primary-container": "rgb(var(--hh-on-primary-container) / <alpha-value>)",
        "on-primary-fixed": "rgb(var(--hh-on-primary-fixed) / <alpha-value>)",
        "on-primary-fixed-variant": "rgb(var(--hh-on-primary-fixed-variant) / <alpha-value>)",
        "on-secondary": "rgb(var(--hh-on-secondary) / <alpha-value>)",
        "on-secondary-container": "rgb(var(--hh-on-secondary-container) / <alpha-value>)",
        "on-secondary-fixed": "rgb(var(--hh-on-secondary-fixed) / <alpha-value>)",
        "on-secondary-fixed-variant": "rgb(var(--hh-on-secondary-fixed-variant) / <alpha-value>)",
        "on-surface": "rgb(var(--hh-on-surface) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--hh-on-surface-variant) / <alpha-value>)",
        "on-tertiary": "rgb(var(--hh-on-tertiary) / <alpha-value>)",
        "on-tertiary-container": "rgb(var(--hh-on-tertiary-container) / <alpha-value>)",
        "on-tertiary-fixed": "rgb(var(--hh-on-tertiary-fixed) / <alpha-value>)",
        "on-tertiary-fixed-variant": "rgb(var(--hh-on-tertiary-fixed-variant) / <alpha-value>)",
        "outline": "rgb(var(--hh-outline) / <alpha-value>)",
        "outline-variant": "rgb(var(--hh-outline-variant) / <alpha-value>)",
        "primary": "rgb(var(--hh-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--hh-primary-container) / <alpha-value>)",
        "primary-fixed": "rgb(var(--hh-primary-fixed) / <alpha-value>)",
        "primary-fixed-dim": "rgb(var(--hh-primary-fixed-dim) / <alpha-value>)",
        "secondary": "rgb(var(--hh-secondary) / <alpha-value>)",
        "secondary-container": "rgb(var(--hh-secondary-container) / <alpha-value>)",
        "secondary-fixed": "rgb(var(--hh-secondary-fixed) / <alpha-value>)",
        "secondary-fixed-dim": "rgb(var(--hh-secondary-fixed-dim) / <alpha-value>)",
        "surface": "rgb(var(--hh-surface) / <alpha-value>)",
        "surface-bright": "rgb(var(--hh-surface-bright) / <alpha-value>)",
        "surface-container": "rgb(var(--hh-surface-container) / <alpha-value>)",
        "surface-container-high": "rgb(var(--hh-surface-container-high) / <alpha-value>)",
        "surface-container-highest": "rgb(var(--hh-surface-container-highest) / <alpha-value>)",
        "surface-container-low": "rgb(var(--hh-surface-container-low) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--hh-surface-container-lowest) / <alpha-value>)",
        "surface-dim": "rgb(var(--hh-surface-dim) / <alpha-value>)",
        "surface-tint": "rgb(var(--hh-surface-tint) / <alpha-value>)",
        "surface-variant": "rgb(var(--hh-surface-variant) / <alpha-value>)",
        "tertiary": "rgb(var(--hh-tertiary) / <alpha-value>)",
        "tertiary-container": "rgb(var(--hh-tertiary-container) / <alpha-value>)",
        "tertiary-fixed": "rgb(var(--hh-tertiary-fixed) / <alpha-value>)",
        "tertiary-fixed-dim": "rgb(var(--hh-tertiary-fixed-dim) / <alpha-value>)"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "gutter": "1.5rem",
        "space-xl": "2.5rem",
        "margin-mobile": "1rem",
        "margin": "3rem",
        "gutter-mobile": "1rem",
        "space-lg": "1.5rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-xs": "0.25rem"
      },
      "fontFamily": {
        "headline-md": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "body-lg": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "label-md": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "headline-lg-mobile": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "body-md": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "headline-lg": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "headline-sm": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "display": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "label-lg": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "label-sm": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "title-md": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "display-mobile": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ],
        "body-sm": [
          "Be Vietnam Pro", "system-ui", "sans-serif"
        ]
      },
      "fontSize": {
        "headline-md": [
          "24px",
          {
            "lineHeight": "32px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-lg": [
          "18px",
          {
            "lineHeight": "28px",
            "fontWeight": "400"
          }
        ],
        "label-md": [
          "12px",
          {
            "lineHeight": "16px",
            "letterSpacing": "0.04em",
            "fontWeight": "600"
          }
        ],
        "headline-lg-mobile": [
          "26px",
          {
            "lineHeight": "34px",
            "letterSpacing": "-0.01em",
            "fontWeight": "600"
          }
        ],
        "body-md": [
          "16px",
          {
            "lineHeight": "24px",
            "fontWeight": "400"
          }
        ],
        "headline-lg": [
          "36px",
          {
            "lineHeight": "44px",
            "letterSpacing": "-0.015em",
            "fontWeight": "600"
          }
        ],
        "headline-sm": [
          "20px",
          {
            "lineHeight": "28px",
            "fontWeight": "600"
          }
        ],
        "display": [
          "48px",
          {
            "lineHeight": "56px",
            "letterSpacing": "-0.02em",
            "fontWeight": "700"
          }
        ],
        "label-lg": [
          "14px",
          {
            "lineHeight": "20px",
            "letterSpacing": "0.02em",
            "fontWeight": "600"
          }
        ],
        "label-sm": [
          "11px",
          {
            "lineHeight": "14px",
            "letterSpacing": "0.05em",
            "fontWeight": "500"
          }
        ],
        "title-md": [
          "18px",
          {
            "lineHeight": "26px",
            "fontWeight": "600"
          }
        ],
        "display-mobile": [
          "32px",
          {
            "lineHeight": "40px",
            "letterSpacing": "-0.01em",
            "fontWeight": "700"
          }
        ],
        "body-sm": [
          "14px",
          {
            "lineHeight": "20px",
            "fontWeight": "400"
          }
        ]
      }
    }
  },
  "corePlugins": {
    "container": false
  },
  "content": { "relative": true, "files": [
    "../../Front_end/index.html",
    "../../Front_end/pages/{museum-detail,ticket-selection,checkout,payment-result,my-tickets,ticket-detail,event-list,event-detail,survey,group-booking,profile}.html",
    "../../Front_end/js/pages/{home,museum-detail,ticket-selection,checkout,payment-result,my-tickets,ticket-detail,event-list,event-detail,survey,group-booking,profile}.js"
  ] }
};
