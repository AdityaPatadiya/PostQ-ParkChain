module: {
  rules: [
    {
      test: /\.js$/,
      enforce: "pre",
      exclude: /node_modules\/html5-qrcode/,
      use: ["source-map-loader"],
    },
  ],
}
