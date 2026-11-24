import p from "path";

/**
 * This class is a helper for 
 */
export default class AbsolutePathResolver {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

    /**
     * Resolves a relative path to an absolute path based on the base URL.
     * @param relativePath The relative path to resolve.
     * @returns The absolute path as a string.
     */
    resolve(relativePath: string): string {
        if (this.isAbsolutePath(relativePath)) {
            return relativePath; // If it's already an absolute path, return it as is.
        }
        
        // Resolve the relative path against the base URL.
        const absolutePath = p.resolve(this.baseUrl, relativePath);
        return absolutePath;
    }

    /**
     * Absolute on any OS: templates and assignment files may be written on
     * Windows (C:\..., \\server\share) and used on Linux/macOS, or the other way round.
     */
    private isAbsolutePath(path: string): boolean {
        return p.isAbsolute(path) || /^[a-zA-Z]:[\\/]/.test(path) || path.startsWith('\\\\')
    }

}