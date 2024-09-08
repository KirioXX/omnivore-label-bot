{ }:

let pkgs = import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/e05605ec414618eab4a7a6aea8b38f6fbbcc8f08.tar.gz") { overlays = [ (import (builtins.fetchTarball "https://github.com/railwayapp/nix-npm-overlay/archive/main.tar.gz")) ]; };
in with pkgs;
  let
    APPEND_LIBRARY_PATH = "${lib.makeLibraryPath [  ] }";
    myLibraries = writeText "libraries" ''
      export LD_LIBRARY_PATH="${APPEND_LIBRARY_PATH}:$LD_LIBRARY_PATH"
      
    '';
  in
    buildEnv {
      name = "e05605ec414618eab4a7a6aea8b38f6fbbcc8f08-env";
      paths = [
        (runCommand "e05605ec414618eab4a7a6aea8b38f6fbbcc8f08-env" { } ''
          mkdir -p $out/etc/profile.d
          cp ${myLibraries} $out/etc/profile.d/e05605ec414618eab4a7a6aea8b38f6fbbcc8f08-env.sh
        '')
        nodejs_18 openssl pnpm-9_x
      ];
    }
