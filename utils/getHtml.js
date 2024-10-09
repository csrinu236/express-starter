module.exports = ({ link }) => {
  return `<html>
  <body
    style="
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
        Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
        sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      margin-bottom: 2rem;
      padding: 40px 30px;
      letter-spacing: 1px;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 0 auto;
        background: #fff;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0 0px 10px 3px rgba(0, 0, 0, 0.1);
      "
    >
      <h1
        style="
          color: #007bff;
          font-size: 18px;
          margin-top: 0;
          border-bottom: 1px solid #ddd;
          padding-bottom: 12px;
        "
      >
        Please verify your email by clicking the button below:
      </h1>
      <a
        href="${link}"
        style="
          display: inline-block;
          padding: 12px 24px;
          margin-top: 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          text-align: center;
        "
        >Verify Email</a
      >
    </div>
  </body>
</html>`;
};
