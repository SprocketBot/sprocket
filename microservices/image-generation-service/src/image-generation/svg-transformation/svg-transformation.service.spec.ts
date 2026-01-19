/* eslint-disable @typescript-eslint/unbound-method */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { SvgTransformationService } from './svg-transformation.service';

describe('SvgTransformationService', () => {
  let service: SvgTransformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SvgTransformationService],
    }).compile();

    service = module.get<SvgTransformationService>(SvgTransformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyFillTransformation', () => {
    it('should replace fill if the attribute is present', async () => {
      const mockedElement = {
        hasAttribute: jest.fn().mockImplementation(v => v === 'fill'),
        setAttribute: jest.fn(),
      } as unknown as Element;

      await service.applyFillTransformation(mockedElement, 'myValue');

      expect(mockedElement.hasAttribute).toHaveBeenCalledTimes(2);
      expect(mockedElement.setAttribute).toHaveBeenCalledWith('fill', 'myValue');
    });
  });
});
