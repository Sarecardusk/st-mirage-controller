{
  description = "Mirage Controller";

  inputs = {
    nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1"; # unstable Nixpkgs
    fenix = {
      url = "https://flakehub.com/f/nix-community/fenix/0.1";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    git-hooks = {
      url = "https://flakehub.com/f/cachix/git-hooks.nix/0.1";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs =
    { self, ... }@inputs:

    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            pkgs = import inputs.nixpkgs {
              inherit system;
              overlays = [
                inputs.self.overlays.default
              ];
            };
          }
        );
    in
    {
      # Run hooks in sandbox with `nix flake check`
      checks = forEachSupportedSystem (
        { pkgs }:
        {
          pre-commit-check = inputs.git-hooks.lib.${pkgs.system}.run {
            src = ./.;
            hooks = {
              # Nix formatting
              nixfmt-rfc-style.enable = true;

              # TypeScript/Vue linting & formatting
              eslint = {
                enable = true;
                name = "ESLint";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm exec eslint --fix";
                files = "\\.(ts|vue|js|mjs)$";
                pass_filenames = false;
              };

              prettier = {
                enable = true;
                name = "Prettier";
                entry = "${pkgs.nodePackages.pnpm}/bin/pnpm exec prettier --write";
                files = "\\.(ts|vue|js|json|css|md)$";
              };

              # Rust formatting & linting
              rustfmt = {
                enable = true;
                entry = "cargo fmt --manifest-path wasm/Cargo.toml --all";
                files = "^wasm/.*\\.rs$";
                pass_filenames = false;
              };
              clippy = {
                enable = true;
                entry = "cargo clippy --manifest-path wasm/Cargo.toml --all-features -- -D warnings";
                files = "^wasm/.*\\.rs$";
                pass_filenames = false;
              };

              # General checks
              check-merge-conflicts.enable = true;
              check-added-large-files.enable = true;
              end-of-file-fixer.enable = true;
              trim-trailing-whitespace.enable = true;
            };
          };
        }
      );

      overlays.default = final: prev: rec {
        nodejs = prev.nodejs;
        yarn = (prev.yarn.override { inherit nodejs; });
        rustToolchain =
          with inputs.fenix.packages.${prev.stdenv.hostPlatform.system};
          combine (
            with stable;
            [
              clippy
              rustc
              cargo
              rustfmt
              rust-src
              targets.wasm32-unknown-unknown.stable.rust-std
            ]
          );
      };

      devShells = forEachSupportedSystem (
        { pkgs }:
        let
          pre-commit-check = self.checks.${pkgs.system}.pre-commit-check;
        in
        {
          default = pkgs.mkShellNoCC {
            inherit (pre-commit-check) shellHook;

            packages =
              with pkgs;
              [
                # [nix]
                nixfmt

                # [nodejs] via vite
                node2nix
                nodejs
                nodePackages.pnpm
                yarn

                # [rust] base
                rustToolchain
                openssl
                pkg-config
                cargo-deny
                cargo-edit
                cargo-watch
                rust-analyzer
                # for wasm-pack
                wasm-pack
                wasm-bindgen-cli
                binaryen
                wabt
              ]
              ++ pre-commit-check.enabledPackages;

            env = {
              # Required by rust-analyzer
              RUST_SRC_PATH = "${pkgs.rustToolchain}/lib/rustlib/src/rust/library";
            };
          };
        }
      );
    };
}
