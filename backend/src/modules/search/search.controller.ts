import { Request, Response, NextFunction } from 'express';
import { SearchService } from './search.service';
import { sendSuccess } from '../../utils/response';

export class SearchController {
  private searchService: SearchService;

  constructor() {
    this.searchService = new SearchService();
  }

  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const q = (req.query.q as string) || '';
      const result = await this.searchService.searchAll(q);
      sendSuccess(res, result, 200, 'Global search executed successfully');
    } catch (error) {
      next(error);
    }
  };
}
