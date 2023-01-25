<script>
    import { createApp } from 'whyframe:app';
    import "../../../app.css";
  
    /**
     * @param {HTMLElement} node
     */
    function app(node) {
      createApp(node)
    }
  </script>
  
  <div use:app />