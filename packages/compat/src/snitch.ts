import Funnel from 'broccoli-funnel';
import walkSync from 'walk-sync';
import { Tree } from 'broccoli-plugin';

/*
  This is used to monitor when addons are emitting badly-behaved broccoli
  trees that don't follow directory-naming conventions.

  We only check on the first build, on the assumption that it's rare to change
  after that.
*/

export default class Snitch extends Funnel {
  private allowedPaths: RegExp;
  private foundBadPaths: Function;
  private mustCheck = true;

  constructor(
    inputTree: Tree,
    snitchOptions: { allowedPaths: RegExp, foundBadPaths: Function },
    funnelOptions: any
  ) {
    super(inputTree, funnelOptions);
    this.allowedPaths = snitchOptions.allowedPaths;
    this.foundBadPaths = snitchOptions.foundBadPaths;
  }

  build() {
    if (this.mustCheck) {
      let badPaths: string[] = [];
      walkSync(this.inputPaths[0], { directories: false })
        .map(filename => {
          if (!this.allowedPaths.test(filename)) {
            badPaths.push(filename);
          }
        });
      if (badPaths.length > 0) {
        this.foundBadPaths(badPaths);
      }
      this.mustCheck = false;
    }
    return super.build();
  }
}
