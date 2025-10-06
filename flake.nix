{
  description = "A SillyTavern Extension for my own perset";

  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    git-hooks = {
      url = "github:cachix/git-hooks.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: inputs.nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import inputs.nixpkgs {
          inherit system;
          overlays = [
            inputs.rust-overlay.overlays.default
            inputs.self.overlays.default
          ];
        };
      });
    in
    {
      overlays.default = final: prev: {
        rustToolchain =
          let
            rust = prev.rust-bin;
          in
          if builtins.pathExists ./rust-toolchain.toml then
            rust.fromRustupToolchainFile ./rust-toolchain.toml
          else if builtins.pathExists ./rust-toolchain then
            rust.fromRustupToolchainFile ./rust-toolchain
          else
            rust.stable.latest.default.override {
              targets = [ "wasm32-unknown-unknown" ];
              extensions = [ "rust-src" "rustfmt" ];
            };
      };

      devShells = forEachSupportedSystem ({ pkgs }:
        let
          pre-commit = inputs.git-hooks.lib.${pkgs.system}.run {
            src = ./.;
            hooks = {
              # Auto-format TypeScript/JavaScript files
              prettier = {
                enable = true;
                name = "prettier (auto-format)";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm format";
                files = "\\.(ts|tsx|js|jsx|css|scss|html|vue)$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
              
              # Block commit on ESLint errors
              eslint = {
                enable = true;
                name = "eslint";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm lint";
                files = "\\.(ts|tsx|js|jsx|vue)$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
              
              # Block commit on TypeScript type errors
              typecheck = {
                enable = true;
                name = "typecheck";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm typecheck";
                files = "\\.(ts|tsx|vue)$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
              
              # Auto-format Rust files
              rustfmt = {
                enable = true;
                name = "rustfmt (auto-format)";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm wasm:fmt";
                files = "\\.rs$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
              
              # Block commit on Rust compilation errors
              cargo-check = {
                enable = true;
                name = "cargo check";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm wasm:check";
                files = "\\.rs$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
              
              # Block commit on Clippy warnings (treat warnings as errors)
              clippy = {
                enable = true;
                name = "clippy";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm wasm:clippy";
                files = "\\.rs$";
                excludes = [ "^\\.temp-.*" ];
                pass_filenames = false;
              };
            };
          };
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              # rust
              rustToolchain
              openssl
              pkg-config
              cargo-deny
              cargo-edit
              cargo-watch
              rust-analyzer
              wasm-pack
              binaryen  # provides wasm-opt

              # nodejs
              node2nix
              nodejs
              nodePackages.pnpm
              yarn
            ];

            inherit (pre-commit) shellHook;

            env = {
              # Required by rust-analyzer
              RUST_SRC_PATH = "${pkgs.rustToolchain}/lib/rustlib/src/rust/library";
            };
          };
        });
    };
}

