import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyGuard {
  canActivate() {
    return true;
  }
}
